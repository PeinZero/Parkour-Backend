import BookingRequests from '../models/bookingRequest.js';
import Spot from '../models/spot.js';
import User from '../models/user.js';
import Seller from '../models/seller.js';
import Parker from '../models/parker.js';
import { throwError } from '../helpers/helperfunctions.js';
import Car from '../models/car.js';

export let create = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.body.spotId;
  const carId = req.body.carId;
  const day = req.body.day;
  const slots = req.body.slots;
  // const startTime = req.body.startTime;
  // const endTime = req.body.endTime;
  const message = req.body.message;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Parker', 403);

    const parker = await Parker.findById(user.parker);
    if (!parker)
      throwError(
        `Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`,
        500
      );

    const car = await Car.findById(carId);
    if (!car) throwError('Car not found', 404);

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (spot.owner.toString() === userId.toString())
      throwError('Owner cannot book his own spot.', 403);

    const bookingRequest = new BookingRequests({
      bookingRequestor: parker._id,
      spotOwner: spot.owner,
      spot: spotId,
      car,
      day,
      // startTime,
      // endTime,
      slots,
      message
    });

    parker.bookingRequests.push(bookingRequest);
    spot.bookingRequests.push(bookingRequest);
    await bookingRequest.save();
    await parker.save();
    await spot.save();

    res.status(200).json({
      message: 'Booking request created successfully',
      bookingRequest
    });
  } catch (err) {
    next(err);
  }
};

export let getSellerRequests = async (req, res, next) => {
  const userId = req.userId;
  let filter = req.query.filter;
  let selector = {};

  try {
    if (!filter) throwError(`Missing Query Param: "filter"`, 400);
    filter = filter.toString();

    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

    selector = {
      spotOwner: seller._id
    };

    if (filter !== 'all') {
      selector.status = filter;
    }

    const bookingRequests = await BookingRequests.find(selector)
      .populate({
        path: 'spot',
        select:
          'addressLine1 addressLine2 nearestLandmark location comment pricePerHour'
      })
      .populate('car');

    res.status(200).json({
      message: `Booking requests for Seller with status "${filter}" retrieved successfully`,
      total: bookingRequests.length,
      bookingRequests
    });
  } catch (err) {
    next(err);
  }
};

export let getParkerRequests = async (req, res, next) => {
  const userId = req.userId;
  let filter = req.query.filter;
  let selector = {};

  try {
    if (!filter) throwError(`Missing Query Param: "filter"`, 400);
    filter = filter.toString();

    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Parker', 403);
    const parker = await Parker.findById(user.parker);
    if (!parker)
      throwError(
        `Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`,
        500
      );

    selector = {
      bookingRequestor: parker._id
    };

    if (filter !== 'all') {
      selector.status = filter;
    }

    const bookingRequests = await BookingRequests.find(selector)
      .populate({
        path: 'spot',
        select:
          'addressLine1 addressLine2 nearestLandmark location comment pricePerHour'
      })
      .populate('car');

    res.status(200).json({
      message: `Booking requests for Parker with status "${filter}" retrieved successfully`,
      total: bookingRequests.length,
      bookingRequests
    });
  } catch (err) {
    next(err);
  }
};

// cancel request
export let remove = async (req, res, next) => {};

export let accept = async (req, res, next) => {
  try {
    const bookingRequestId = req.params.bookingRequestId;

    const bookingRequest = await BookingRequests.findById(bookingRequestId);
    if (!bookingRequest) throwError('Booking Request not found', 404);
    console.log(bookingRequest);

    const spot = await Spot.findById(bookingRequest.spot);
    if (!spot) throwError('Spot not found', 404);

    // *Error Checking: If slot is invalid (out of bounds)
    if (!checkSlotAvailability(bookingRequest.day, bookingRequest.slots[0]))
      throwError('Requested time slot is invalid.', 409);
    // make sure the parking time starts atleast 1 hour after booking acceptance.
    // check if the spot has a valid availability according to the requested slot.
    // make sure the requested slot falls in atleast one of the avaialbe slots for the day

    // *Spot
    // change isBooked to true
    // set bookingStartTime
    // set bookingEndTime

    // *Spot > Availability
    // subtract requested time slots
    // split time slots if needed

    res.status(200).json({
      msg: 'done'
    });
  } catch (err) {
    next(err);
  }
};

function checkSlotAvailability(day, requestedSlot) {
  console.log('==== DAY ===');
  console.log(new Date().toISOString());
  console.log(new Date());
  console.log(new Date().getDate());
  console.log(new Date(day).getDate());
  console.log(new Date() > new Date(day));
  console.log('=======');

  // if requested slot date has passed, return false
  if (new Date() > new Date(day)) {
    return false;
  }

  console.log(new Date().getDay());
  console.log(new Date().getHours());
  console.log(requestedSlot.startTime.getHours() - 1);

  console.log('=======');
  console.log('start time ' + requestedSlot.startTime.getHours());
  console.log('end time ' + requestedSlot.endTime.getHours());
  console.log('=======');
  //! using get hours instead of getUTChours. Inquire.
  if (new Date().getHours() >= requestedSlot.startTime.getHours() - 1)
    return false;
  else return true;
}

function compareSlotsForConflicts(requestedSlot, availableSlot) {
  console.log(requestedSlot);
  console.log(availableSlot);
  // if (requestedSlot.getUTCHours() < )
}
