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
    if (!parker) throwError(`Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`, 500);

    const car = await Car.findById(carId);
    if (!car) throwError('Car not found', 404);

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (spot.owner.toString() === userId.toString()) throwError('Owner cannot book his own spot.', 403);

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
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    selector = {
      spotOwner: seller._id
    };

    if (filter !== 'all') {
      selector.status = filter;
    }

    const bookingRequests = await BookingRequests.find(selector)
      .populate({
        path: 'spot',
        select: 'addressLine1 addressLine2 nearestLandmark location comment pricePerHour'
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
    if (!parker) throwError(`Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`, 500);

    selector = {
      bookingRequestor: parker._id
    };

    if (filter !== 'all') {
      selector.status = filter;
    }

    const bookingRequests = await BookingRequests.find(selector)
      .populate({
        path: 'spot',
        select: 'addressLine1 addressLine2 nearestLandmark location comment pricePerHour'
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

    let spot = await Spot.findById(bookingRequest.spot);
    if (!spot) throwError('Spot not found', 404);

    // *Error Checking: If slot is invalid (out of bounds)
    if (!isRequestValidForAcceptance(bookingRequest.day, bookingRequest.slots[0])) throwError('Requested time slot is invalid.', 409);

    // *Spot > Availability
    const indexOfAvailableDay = getIndexOfAvailableDay(bookingRequest.day, spot.availability);

    if (!indexOfAvailableDay < 0) throwError('No slots available for requested day.', 404);

    computeSlots(indexOfAvailableDay, spot.availability, bookingRequest.slots[0]);

    spot.isBooked = true;
    const bookingRequestDay = new Date(bookingRequest.day);
    spot.bookingStartTime = new Date(
      bookingRequestDay.getFullYear(),
      bookingRequestDay.getMonth(),
      bookingRequestDay.getDate(),
      bookingRequest.slots[0].startTime.getHours()
    );

    spot.bookingEndTime = new Date(
      bookingRequestDay.getFullYear(),
      bookingRequestDay.getMonth(),
      bookingRequestDay.getDate(),
      bookingRequest.slots[0].endTime.getHours()
    );

    bookingRequest.status = 'accepted';
    // await bookingRequest.save();
    // await spot.save();

    res.status(200).json({
      msg: 'Booking request accepted.',
      spot
    });
  } catch (err) {
    next(err);
  }
};

function isRequestValidForAcceptance(requestedDay, requestedSlot) {
  const _CURRENT_DATE = new Date();
  const CURRENT_MONTH = _CURRENT_DATE.getMonth();
  const CURRENT_DATE_NUMBER = _CURRENT_DATE.getDate();
  const _requestedDay = new Date(requestedDay);
  const _requestedSlotStartTime = requestedSlot.startTime;

  const testStartTime = new Date(requestedSlot.startTime);

  // if requested slot date/time has passed, return false
  if (_CURRENT_DATE.getTime() > _requestedDay.getTime()) {
    return false;
  } else if (_CURRENT_DATE >= testStartTime.setHours(testStartTime.getHours() - 1) && _requestedDay.getDate() == CURRENT_DATE_NUMBER) {
    return false;
  }
  return true;
}

function updateTimeSlot(_requestedDay, _requestedSlot) {
  const requestedStartTime = new Date(_requestedDay);
  const requestedEndTime = new Date(_requestedDay);

  requestedStartTime.setHours(_requestedSlot.startTime.getHours());
  requestedStartTime.setMinutes(_requestedSlot.startTime.getMinutes());

  requestedEndTime.setHours(_requestedSlot.endTime.getHours());
  requestedEndTime.setMinutes(_requestedSlot.endTime.getMinutes());

  return { requestedStartTime, requestedEndTime };
}
/* old function
! function computeSlots(indexOfAvailableDay, spotAvailability, requestedSlot) {
  const baseDate = new Date(requestedSlot.startTime);
  const availableSlots = spotAvailability[indexOfAvailableDay].slots;
  const indexOfMatchedSlot = getIndexOfMatachedSlot(availableSlots, requestedSlot);
  if (indexOfMatchedSlot < 0) throwError("Internal Server Error. Requested time slot isn't available.", 500);

  let availableStartHours = availableSlots[indexOfMatchedSlot].startTime.getHours();
  let availableEndHours = availableSlots[indexOfMatchedSlot].endTime.getHours();
  let requestedStartHours = requestedSlot.startTime.getHours();
  let requestedEndHours = requestedSlot.endTime.getHours();

  console.log(availableSlots[indexOfMatchedSlot].startTime.toLocaleString('en-US', { hours: 'numeric', minutes: 'numeric', hour12: true }));

  if (availableStartHours === requestedStartHours && availableEndHours === requestedEndHours) {
    console.log('====>>  Full slot matched, deleting slot entry. <<====\n');
    spotAvailability[indexOfAvailableDay].slots.splice(indexOfMatchedSlot, 1);
  } else if (availableStartHours === requestedStartHours) {
    console.log('====>>  Start time of slot matched, changing startTime of slot. <<====\n');
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].startTime.setHours(requestedEndHours);
  } else if (availableEndHours === requestedEndHours) {
    console.log('====>>  End time of slot matched, changing endTime of slot. <<====\n');
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.setHours(requestedStartHours);
    console.log(spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot]);
  } else {
    console.log('====>> Requested slot lies in the middle, changed current slot, and add a new slot. <<====\n');
    // change the slot
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.setHours(requestedStartHours);

    // splice: add a new slot
    const newObjectId = (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    const newSlot = {
      startTime: new Date(baseDate).setHours(requestedEndHours),
      endTime: new Date(baseDate).setHours(availableEndHours),
      _id: newObjectId
    };

    spotAvailability[indexOfAvailableDay].slots.splice(indexOfMatchedSlot + 1, 0, newSlot);
  }

  */

function computeSlots(indexOfAvailableDay, spotAvailability, requestedSlot) {
  const baseDate = new Date(requestedSlot.startTime);
  const { requestedStartTime, requestedEndTime} = updateTimeSlot(requestedSlot);
  const availableSlots = spotAvailability[indexOfAvailableDay].slots;
  const indexOfMatchedSlot = getIndexOfMatachedSlot(availableSlots, requestedSlot);
  if (indexOfMatchedSlot < 0) throwError("Internal Server Error. Requested time slot isn't available.", 500);

  let availableStartHours = availableSlots[indexOfMatchedSlot].startTime.getHours();
  let availableEndHours = availableSlots[indexOfMatchedSlot].endTime.getHours();
  let requestedStartHours = requestedSlot.startTime.getHours();
  let requestedEndHours = requestedSlot.endTime.getHours();

  console.log(availableSlots[indexOfMatchedSlot].startTime.toLocaleString('en-US', { hours: 'numeric', minutes: 'numeric', hour12: true }));

  if (availableStartHours === requestedStartHours && availableEndHours === requestedEndHours) {
    console.log('====>>  Full slot matched, deleting slot entry. <<====\n');
    spotAvailability[indexOfAvailableDay].slots.splice(indexOfMatchedSlot, 1);
  } else if (availableStartHours === requestedStartHours) {
    console.log('====>>  Start time of slot matched, changing startTime of slot. <<====\n');
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].startTime.setHours(requestedEndHours);
  } else if (availableEndHours === requestedEndHours) {
    console.log('====>>  End time of slot matched, changing endTime of slot. <<====\n');
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.setHours(requestedStartHours);
    console.log(spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot]);
  } else {
    console.log('====>> Requested slot lies in the middle, changed current slot, and add a new slot. <<====\n');
    // change the slot
    spotAvailability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.setHours(requestedStartHours);

    // splice: add a new slot
    const newObjectId = (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    const newSlot = {
      startTime: new Date(baseDate).setHours(requestedEndHours),
      endTime: new Date(baseDate).setHours(availableEndHours),
      _id: newObjectId
    };

    spotAvailability[indexOfAvailableDay].slots.splice(indexOfMatchedSlot + 1, 0, newSlot);
  }

  // // TODO: Debug consoles below:
  // console.log('++++++++++ Final slots array ++++++++++\n');
  // console.log(spotAvailability[indexOfAvailableDay].slots);
  // console.log('\n\n __ Individual slots __ \n');

  // spotAvailability[indexOfAvailableDay].slots.forEach((el) => {
  //   console.log(el.startTime.getHours() + ' to ' + el.endTime.getHours());
  // });
  // console.log('\n++++++++++ ++++++++++ ++++++++++ ++++++++++');
  // // TODO: Debug consoles above:
  // console.log('\n\n \t\t ----------- <> ----------- \n\n\n\n');

  // console.log('\n\n (((( \n\n');
  // console.log(spotAvailability);
  // console.log(' \n\n (((( \n\n');

  return true;
}

function getIndexOfAvailableDay(requestedDay, availability) {
  return availability.findIndex((availableDay) => availableDay.slotDate.toISOString() === new Date(requestedDay).toISOString());
}

function getIndexOfMatachedSlot(availableSlots, requestedSlot) {
  return availableSlots.findIndex(
    (availableSlot) =>
      !(requestedSlot.startTime.getHours() < availableSlot.startTime.getHours()) &&
      !(requestedSlot.endTime.getHours() > availableSlot.endTime.getHours())
  );
}
