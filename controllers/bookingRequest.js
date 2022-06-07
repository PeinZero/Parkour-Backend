import BookingRequests from '../models/bookingRequest.js';
import Spot from '../models/spot.js';
import User from '../models/user.js';
import Seller from '../models/seller.js';
import Parker from '../models/parker.js';
import Car from '../models/car.js';
import Notification from '../models/notification.js';

import { throwError } from '../helpers/helperfunctions.js';

import io from '../socket/socketSetup.js';
import transactions from '../helpers/transactionHelpers.js';
import transactionHelpers from '../helpers/transactionHelpers.js';

const TIMECONFIG = { hours: 'numeric', minutes: 'numeric', hour12: true };

export let create = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.body.spotId;
  const carId = req.body.carId;
  const day = req.body.day;
  const slots = req.body.slots;
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

    // Create Notification
    const sellerUser = await User.findOne({ seller: spot.owner });

    const existingNotification = await Notification.findOne({ user: sellerUser._id });

    const time = new Date();

    const notification = {
      text: `${user.name} sent you a booking Request for ${spot.spotName}`,
      target: 'Seller',
      time: time,
      from: user.name
    };

    if (existingNotification) {
      existingNotification.notifications.push(notification);
      await existingNotification.save();
    } else {
      const newNotification = new Notification({
        user: sellerUser._id,
        notifications: [notification]
      });
      await newNotification.save();
    }

    if (sellerUser.socketId) {
      const sockets = await io.in(sellerUser.socketId).fetchSockets();
      const receiverSocket = sockets[0];
      if (receiverSocket) {
        receiverSocket.emit('ReceiveNotification', { notification });
      }
    }

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
export let reject = async (req, res, next) => {
  const userId = req.userId;
  const bookingRequestId = req.params.bookingRequestId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    const bookingRequest = await BookingRequests.findById(bookingRequestId);
    if (!bookingRequest) throwError('Booking request not found', 404);
    if (bookingRequest.status === 'past' || bookingRequest.status === 'rejected') throwError('Booking request already cancelled', 400);
    await bookingRequest.deleteOne();

    res.status(200).json({
      message: 'Booking request rejected successfully'
    });
  } catch (err) {
    next(err);
  }
  // bookingRequewst status should not be "rejected" or "past"
};

export let accept = async (req, res, next) => {
  try {
    const bookingRequestId = req.params.bookingRequestId;

    const bookingRequest = await BookingRequests.findById(bookingRequestId);
    if (!bookingRequest) throwError('Booking Request not found', 404);

    let spot = await Spot.findById(bookingRequest.spot);
    if (!spot) throwError('Spot not found', 404);

    // *Spot > Availability
    const indexOfAvailableDay = getIndexOfAvailableDay(bookingRequest.day, spot.availability);

    if (!indexOfAvailableDay < 0) throwError('No slots available for requested day.', 404);

    const requestedSlot = updateRequestedTimeSlot(bookingRequest.day, bookingRequest.slots[0]);

    const indexOfMatchedSlot = getIndexOfMatchedSlot(
      spot.availability[indexOfAvailableDay].slotDate,
      spot.availability[indexOfAvailableDay].slots,
      requestedSlot
    );

    console.log('\n----' + 'Index of slot: ' + indexOfMatchedSlot + ' ----\n');
    if (indexOfMatchedSlot < 0 || indexOfMatchedSlot === undefined)
      throwError('Internal Server Error. Requested time slot is invalid or not available anymore.');

    const matchedAvailableSlot = updateAvailableTimeSlot(
      spot.availability[indexOfAvailableDay].slotDate,
      spot.availability[indexOfAvailableDay].slots[indexOfMatchedSlot]
    );

    // *Error Checking: If slot is invalid (out of bounds)
    if (!isRequestValidForAcceptance(requestedSlot)) throwError('Requested time slot is invalid.', 409);

    computeSlots(spot.availability[indexOfAvailableDay], indexOfMatchedSlot, matchedAvailableSlot, requestedSlot);

    /*
      console.log('\n----' + '=== Initial State ===' + '----');
      console.log(spot.availability[indexOfAvailableDay].slots[indexOfMatchedSlot].startTime.toLocaleString('en-US', TIMECONFIG));
      console.log(spot.availability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.toLocaleString('en-US', TIMECONFIG));
      console.log('\n----' + '======' + '----\n');

      console.log('\n----' + '=== Requested Slot ===' + '----');
      console.log(requestedSlot.startTime.toLocaleString('en-US', TIMECONFIG));
      console.log(requestedSlot.endTime.toLocaleString('en-US', TIMECONFIG));
      console.log('\n----' + '======' + '----\n');

      
      console.log('\n----' + '=== Final State ===' + '----');
      console.log(spot.availability[indexOfAvailableDay].slots[indexOfMatchedSlot].startTime.toLocaleString('en-US', TIMECONFIG));
      console.log(spot.availability[indexOfAvailableDay].slots[indexOfMatchedSlot].endTime.toLocaleString('en-US', TIMECONFIG));
      console.log('\n----' + '======' + '----\n');
      */

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

    const requestor = await User.findOne({ parker: bookingRequest.bookingRequestor });
    console.log(requestor);

    // if parker has enough credits, then deduct his money.
    const amountToDeduct = spot.pricePerHour * ((requestedSlot.endTime.getTime() - requestedSlot.startTime.getTime()) / 3600000);
    console.log(amountToDeduct);
    transactionHelpers.deductCredit(requestor, amountToDeduct);

    await bookingRequest.save();
    await spot.save();
    await requestor.save();

    res.status(200).json({
      msg: 'Booking request accepted.',
      spot
    });
  } catch (err) {
    next(err);
  }
};

function computeSlots(matchedDate, indexOfMatchedSlot, matchedAvailableSlot, requestedSlot) {
  const availableSlots = matchedDate.slots;

  const requestedStartString = requestedSlot.startTime.toLocaleString('en-US', TIMECONFIG);
  const requestedEndString = requestedSlot.endTime.toLocaleString('en-US', TIMECONFIG);
  const availableStartString = matchedAvailableSlot.startTime.toLocaleString('en-US', TIMECONFIG);
  const availableEndString = matchedAvailableSlot.endTime.toLocaleString('en-US', TIMECONFIG);

  if (requestedStartString == availableStartString && requestedEndString == availableEndString) {
    console.log('\n====>>  Full slot matched, deleting slot entry. <<====\n');
    availableSlots.splice(indexOfMatchedSlot, 1);
  } else if (requestedStartString === availableStartString) {
    console.log('\n====>>  Starting of slot matched, changing startTime of slot. <<====\n');
    availableSlots[indexOfMatchedSlot].startTime = requestedSlot.endTime;
  } else if (requestedEndString === availableEndString) {
    console.log('\n====>>  Ending of slot matched, changing endTime of slot. <<====\n');
    availableSlots.slots[indexOfMatchedSlot].endTime = requestedSlot.startTime;
  } else {
    console.log('\n====>> Requested slot lies in the middle, changed current slot, and add a new slot. <<====\n');
    // change the slot
    matchedDate.slots[indexOfMatchedSlot].endTime = requestedSlot.startTime;

    // splice: add a new slot
    const newObjectId = (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    const newSlot = {
      startTime: requestedSlot.endTime,
      endTime: matchedAvailableSlot.endTime,
      _id: newObjectId
    };

    availableSlots.splice(indexOfMatchedSlot + 1, 0, newSlot);
  }

  return true;
}

function isRequestValidForAcceptance(requestedSlot) {
  const _CURRENT_DATE = new Date();
  const testStartTime = new Date(requestedSlot.startTime);

  if (_CURRENT_DATE.getTime() > testStartTime.getTime() || _CURRENT_DATE >= testStartTime.setHours(testStartTime.getHours() - 1)) {
    return false;
  }
  return true;
}

function getIndexOfAvailableDay(requestedDay, availability) {
  return availability.findIndex((availableDay) => availableDay.slotDate.toISOString() === new Date(requestedDay).toISOString());
}

function updateRequestedTimeSlot(_requestedDay, _requestedSlot) {
  return fixTimeSlot(_requestedSlot.startTime, _requestedSlot.endTime, _requestedDay);
}

function updateAvailableTimeSlot(_availableDay, _availableSlot) {
  return fixTimeSlot(_availableSlot.startTime, _availableSlot.endTime, _availableDay);
}

function fixTimeSlot(startTime, endTime, dateToFix) {
  const fixedStartTime = new Date(dateToFix);
  const fixedEndTime = new Date(dateToFix);

  fixedStartTime.setHours(startTime.getHours());
  fixedStartTime.setMinutes(startTime.getMinutes());

  fixedEndTime.setHours(endTime.getHours());
  fixedEndTime.setMinutes(endTime.getMinutes());

  return { startTime: fixedStartTime, endTime: fixedEndTime };
}

function getIndexOfMatchedSlot(availableDay, availableSlots, requestedSlot) {
  for (const [index, slot] of availableSlots.entries()) {
    const fixedAvailable = fixTimeSlot(slot.startTime, slot.endTime, availableDay);
    if (!(requestedSlot.startTime < fixedAvailable.startTime) && !(requestedSlot.endTime > fixedAvailable.endTime)) {
      return index;
    }
  }
}
