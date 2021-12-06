import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';

export let registerCar = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    checkIfObjectExists(user, 'User not found');

    if (!user.currentRoleParker) {
      const error = new Error('User is not a Parker');
      error.statusCode = 403;
      throw error;
    }

    const parker = await Parker.findById(user.parker);

    let car = new Car({
      numberPlate: req.body.numberPlate,
      make: req.body.make,
      model: req.body.model,
      color: req.body.color,
      prodYear: req.body.prodYear,
      mileage: req.body.mileage,
      owner: user._id
    });

    // adding car
    await car.save();

    // pushing car to parker.cars
    parker.cars.push(car);
    await parker.save();

    res.status(201).json({
      message: 'Car registered successfully',
      addedCar: car,
      cars: parker.cars
    });
  } catch (err) {
    next(err);
  }
};

export let registerSpot = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    checkIfObjectExists(user, 'User not found');


    if (user.currentRoleParker) {
      const error = new Error('User is not a Seller');
      error.statusCode = 403;
      throw error;
    }
    const seller = await Seller.findById(user.seller);


    const location = new Point({ coordinates: req.body.location });
    await location.save();

    let spot = new Spot({
      name: req.body.name,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      nearestLandmark: req.body.nearestLandmark,
      comment: req.body.comment,
      location,
      imagesURI: req.body.imagesURI,
      pricePerHour: req.body.pricePerHour,
      owner: user._id,

      availability: req.body.availability,
    });

    // adding spot
    await spot.save();

    // pushing spots to seller.activeSpots
    seller.activeSpots.push(spot);
    await seller.save();

    res.status(201).send({
      message: 'Spot added successfully',
      addedSpot: spot,
      activeSpots: seller.activeSpots
    });
  } catch (err) {
    next(err);
  }
};

// export let getRegisteredCars = async (req, res, next) => {
//   // populate registered cars with owner name and mobile number
//   // if (car.populated) check --- DONT REMOVE THESE COMMENTS
// };

export let deleteSpot = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.body.spotId;

  try {
    const user = await User.findById(userId);
    checkIfObjectExists(user, 'User not found');


    const spot = await Spot.findById(spotId);
    checkIfObjectExists(spot, 'Spot not found');


    user.spots = user.spots.filter((spot) => spot._id.toString() !== spotId);
    await user.save();

    // Remove spot
    await spot.remove();

    res.status(200).json({
      message: `Spot deleted successfully!`
    });
  } catch (err) {
    next(err);
  }
};

// ================================== DEV APIS ==================================

export let getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export let getUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    checkIfObjectExists(user, 'User not found');

    res.status(200).json({
      message: 'User fetched successfully!',
      user
    });
  } catch (error) {
    next(error);
  }
};


// ================================== HELPER FUNCTIONS ==================================
function checkIfObjectExists(object, errorMessage) {
  if (!object) {
    const error = new Error(errorMessage);
    error.statusCode = 404;
    throw error;
  }
}

