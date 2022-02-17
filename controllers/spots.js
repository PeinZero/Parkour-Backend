import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import PointData from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import {
  checkIfObjectDoesNotExists,
  checkIfObjectExists,
  throwError
} from '../helpers/helperfunctions.js';

const Point = PointData.Point;

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

// TODO: this isnt working, still not updated
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
    let data = await User.find({ isSeller: true })
      .populate({
        path: 'seller',
        populate: {
          path: 'activeSpots',
          populate: {
            path: 'location'
          }
        }
      })
      .select('name cumulativeRating reviews activeSpots');
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
  const queryLng = req.query.lng;
  const queryLat = req.query.lat;
  const queryRadius = req.query.radius; // is in kilometers
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    
    if (!user) throwError('User not found', 404);
    if (!queryLng || !queryLat) throwError('Missing lat or lng', 422);
    if (!user.currentRoleParker) throwError('User is not a parker', 403);

    const centerSearchPoint = [queryLng, queryLat];
    // const centerSphere = [...centerSearchPoint, queryRadius/ 3963.2]; // in miles

    //  ================ W A Y -- 1 ================
    // const options = {
    //   location: {
    //     $geoWithin: {
    //       $centerSphere: centerSphere
    //     }
    //   }
    // };
    // let spots = await Spot.find(options);

    //  ================ W A Y -- 2 ================
    let spots = await Spot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: centerSearchPoint
          },
          // $minDistance: 500,
          $maxDistance: queryRadius * 1000 // in meters
        }
      }
    });

    // ================ W A Y -- 3 ================
    // let spots = await Spot.find()
    //   .where('location')
    //   .near({
    //     center: centerSearchPoint,
    //     maxDistance: queryRadius/3963.2, // in miles
    //     spherical: true
    //   });

    res.status(200).json({
      spots,
      message: 'Spots found successfully'
    });
  } catch (error) {
    next(error);
  }
};
