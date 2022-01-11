import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { checkIfObjectDoesNotExists } from '../helpers/helperfunctions.js';

// TODO:
// get spot by ID
// switch spot status (active -> inactive & inactive -> active)
// TODO:

export let addSpot = async (req, res, next) => {
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
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      nearestLandmark: req.body.nearestLandmark,
      comment: req.body.comment,
      location,
      imagesURI: req.body.imagesURI,
      pricePerHour: req.body.pricePerHour,
      owner: seller._id,
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
  const spotId = req.params.spotId;

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

export let getAllSpotsBySeller = async (req, res, next) => {
  const userId = req.userId;

  try {
    let user = await User.findById(userId);
    checkIfObjectDoesNotExists(user, 'User not found');

    if (user.currentRoleParker) {
      const error = new Error('User is not a Seller');
      error.statusCode = 403;
      throw error;
    }

    const seller = await Seller.findById(user.seller);
    checkIfObjectDoesNotExists(seller, 'Seller not found');

    const selectedData = await Seller.findById(user.seller)
      .select('activeSpots')
      .populate({
        path: 'activeSpots reviews',
        populate: {
          path: 'location'
        }
      });

    res.status(200).json({
      message: `All Spots found successfully for ${user.name}`,
      data: {
        activeSpots: selectedData.activeSpots,
        seller: {
          name: user.name,
          rating: seller.cumulativeRating,
          reviews: seller.reviews
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export let getAllSpots = async (req, res, next) => {
  try {
    let data = await User.find({ isSeller: true }).populate({
      path: 'seller',
      populate: {
        path: 'activeSpots',
        populate:{
          path: 'location'
        }
      }
    }).select('name cumulativeRating reviews activeSpots');
    checkIfObjectDoesNotExists(data, 'No sellers found');

    res.status(200).json({
      message: 'All Spots found successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export let getSpotsByRadius = async (req, res, next) => {
  // TODO: add radius
};
