import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';

export let registerCar = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      throw error;
    }

    let car = new Car({
      carNumberPlate: req.body.carNumberPlate,
      carMake: req.body.carMake,
      carModel: req.body.carModel,
      carColor: req.body.carColor,
      prodYear: req.body.prodYear,
      carOwner: user._id
    });

    // adding car
    await car.save();

    // adding car to user
    user.cars.push(car);
    await user.save();

    res.status(201).json({
      message: 'Car registered successfully',
      car
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
      return res.status(404).send({
        message: 'User not found'
      });
    }

    const spotLocation = new Point({coordinates: req.body.spotLocation});
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

    // adding spot to user
    user.spots.push(spot);
    await user.save();

    res.status(201).send({
      message: 'Spot added successfully',
      spot
    });
  } catch (err) {
    next(err);
  }
};

export let getRegisteredCars = async (req, res, next) => {
  // populate registered cars with owner name and mobile number
  // if (car.populated) check --- DONT REMOVE THESE COMMENTS
};
