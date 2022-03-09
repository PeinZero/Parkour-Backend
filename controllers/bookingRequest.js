import BookingRequests from '../models/bookingRequest.js';
import Spot from '../models/spot.js';
import Seller from '../models/seller.js';
import Parker from '../models/parker.js';
import { throwError } from '../helpers/helperfunctions.js';

export let create = async (req, res, next) => {
  try {
    const userId = req.userId;
    const spotId = req.body.spotId;
    const carId = req.body.car;
    const day = req.body.day;
    const slots = req.body.slots;
    const message = req.body.message;

    // get user and validate
    // check if user is a parker and is currently parker aswell
    // get parker from user and validate if user is currently parker
    // get spot from spotId and validate if spot is active

    const bookingRequest = new BookingRequests({
        day,
        car,
        slots,
        message,
        userId
    });

    await bookingRequest.save();

    res.status(200).json({
        message: 'Booking request created successfully',
        bookingRequest
    });


  } catch (err) {
    next(err);
  }
};

export let get = (req, res, next) => {};

export let remove = (req, res, next) => {};
