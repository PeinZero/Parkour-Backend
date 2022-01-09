import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { checkIfObjectDoesNotExists } from '../helpers/helperfunctions.js';

export let registerSpot = async (req, res, next) => {
    const userId = req.userId;
  
    try {
      const user = await User.findById(userId);
      checkIfObjectDoesNotExists(user, 'User not found');
  
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
  
        availability: req.body.availability
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


  export let deleteSpot = async (req, res, next) => {
    const userId = req.userId;
    const spotId = req.body.spotId;
  
    try {
      const user = await User.findById(userId);
      checkIfObjectDoesNotExists(user, 'User not found');
  
      const spot = await Spot.findById(spotId);
      checkIfObjectDoesNotExists(spot, 'Spot not found');
  
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
