import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import { checkIfObjectDoesNotExists } from '../helpers/helperfunctions.js';

export let addCar = async (req, res, next) => {
  const userId = req.userId;
  const data = req.body.model;

  try {
    const user = await User.findById(userId);
    checkIfObjectDoesNotExists(user, 'User not found');

    if (!user.currentRoleParker) {
      const error = new Error('User is not a Parker');
      error.statusCode = 403;
      throw error;
    }

    const parker = await Parker.findById(user.parker);

    let car = new Car({
      numberPlate: data.numberPlate,
      make: data.make,
      model: data.model,
      color: data.color,
      prodYear: data.prodYear,
      mileage: data.mileage,
      owner: user._id
    });

    // adding car
    await car.save();

    // pushing car to parker.cars
    parker.cars.push(car);
    await parker.save();

    res.status(201).json({
      message: 'Car added successfully',
      cars: parker.cars
    });
  } catch (err) {
    next(err);
  }
};

export let deleteCar = async (req, res, next) => {
  const userId = req.userId;
  const carId = req.body.carId;

  try {
    const user = await User.findById(userId);
    checkIfObjectDoesNotExists(user, 'User not found');

    if (!user.currentRoleParker) {
      const error = new Error('User is not a Parker');
      error.statusCode = 403;
      throw error;
    }

    const parker = await Parker.findById(user.parker);
    checkIfObjectDoesNotExists(parker, 'Parker not found');

    const car = await Car.findById(carId);
    checkIfObjectDoesNotExists(car, 'Car not found');

    parker.cars = parker.cars.filter((car) => car._id.toString() !== carId);
    await parker.save();

    await car.remove();

    res.status(200).json({
      message: 'Car deleted successfully',
      cars: parker.cars
    });

  } catch (err) {
    next(err);
  }
};
