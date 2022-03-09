import BookingRequests from '../models/bookingRequest.js';
import Spot from '../models/spot.js';
import User from '../models/user.js';
import Seller from '../models/seller.js';
import Parker from '../models/parker.js';
import { throwError } from '../helpers/helperfunctions.js';
import Car from '../models/car.js';

export let create = async (req, res, next) => {
  try {
    const userId = req.userId;
    const spotId = req.body.spotId;
    const carId = req.body.carId;
    const day = req.body.day;
    const slots = req.body.slots;
    const message = req.body.message;

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

    const bookingRequest = new BookingRequests({
      bookingRequestor: parker._id,
      spotOwner: spot.owner,
      spot: spotId,
      car,
      day,
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

export let getAll = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Seller', 403);
    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

    const bookingRequests = await BookingRequests.find({
      spotOwner: seller._id
    });

    res.status(200).json({
      message: 'Booking requests retrieved successfully',
      bookingRequests
    });
  } catch (err) {
    next(err);
  }
};

export let remove = (req, res, next) => {};
