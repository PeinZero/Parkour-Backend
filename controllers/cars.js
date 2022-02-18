import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import PointData from '../models/point.js';
import Parker from '../models/parker.js';
import { throwError } from '../helpers/helperfunctions.js';

// TODO: 
// set default car
// TODO:

const Point = PointData.Point;


export let getAllCarsByParker = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Parker', 403);

    const parker = await Parker.findById(user.parker);
    if (!parker) throwError(`Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`, 500);

    let cars = await Car.find({ owner: parker._id });

    res.status(200).json({
      message: `Successfully fetched all cars of ${user.name}`,
      totalCars: cars.length,
      cars
    });
  } catch (error) {
    next(error);
  }
};

export let addCar = async (req, res, next) => {
  const userId = req.userId;
  const data = req.body.model;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Parker', 403);

    const parker = await Parker.findById(user.parker);
    if (!parker) throwError(`Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`, 500);

    let car = new Car({
      numberPlate: data.numberPlate,
      make: data.make,
      model: data.model,
      color: data.color,
      prodYear: data.prodYear,
      mileage: data.mileage,
      owner: parker._id
    });

    // adding car
    await car.save();

    // pushing car to parker.cars
    parker.cars.push(car);
    await parker.save();

    const cars = await Car.find({ owner: parker._id });

    res.status(201).json({
      message: 'Car added successfully',
      totalCars: cars.length,
      cars: cars
    });
  } catch (err) {
    next(err);
  }
};

export let deleteCar = async (req, res, next) => {
  const userId = req.userId;
  const carId = req.params.carId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (!user.currentRoleParker) throwError('User is not a Parker', 403);

    const parker = await Parker.findById(user.parker);
    if (!parker) throwError(`Internal Server Error: User has a currentRole "Parker" flag but doesn't contain 'Parker' information`, 500);

    const car = await Car.findById(carId);
    if (!car) throwError('Car not found', 404);

    parker.cars = parker.cars.filter((car) => car._id.toString() !== carId);
    await parker.save();
    
    await car.remove();

    const cars = await Car.find({ owner: parker._id });

    res.status(200).json({
      message: 'Car deleted successfully',
      totalCars: cars.length,
      cars: cars
    });
  } catch (err) {
    next(err);
  }
};
