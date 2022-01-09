import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import { checkIfObjectDoesNotExists } from '../helpers/helperfunctions.js';

// REGISTER CAR NOT WORKING FIX IT
export let registerCar = async (req, res, next) => {
    const userId = req.userId;
  
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