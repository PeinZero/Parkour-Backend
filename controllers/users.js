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
    

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.currentRoleParker) {
      const error = new Error('User is not a Parker');
      error.statusCode = 403;
      throw error;
    }

    const parker = await Parker.findById(user.parker);

    let car = new Car({
      carNumberPlate: req.body.carNumberPlate,
      carMake: req.body.carMake,
      carModel: req.body.carModel,
      carColor: req.body.carColor,
      prodYear: req.body.prodYear,
      carMileage: req.body.carMileage,
      carOwner: user._id
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

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.currentRoleParker) {
      const error = new Error('User is not a Seller');
      error.statusCode = 403;
      throw error;
    }
    const seller = await Seller.findById(user.seller);


    const spotLocation = new Point({ coordinates: req.body.spotLocation });
    await spotLocation.save();

    let spot = new Spot({
      spotName: req.body.spotName,
      spotDescription: req.body.spotDescription,
      spotLocation,
      pricePerHour: req.body.pricePerHour,
      spotOwner: user._id
      // spotAvailability: req.body.spotAvailability,
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
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const spot = await Spot.findById(spotId);
    if (!spot) {
      const error = new Error('Spot not found');
      error.statusCode = 404;
      throw error;
    }

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

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }


    res.status(200).json({
      message: 'User fetched successfully!',
      user
    });
  } catch (error) {
    next(error);
  }
};
