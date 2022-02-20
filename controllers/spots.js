import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import PointData from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { throwError } from '../helpers/helperfunctions.js';

const Point = PointData.Point;

// TODO:
// get spot by ID
// switch spot status (active -> inactive & inactive -> active)
// TODO:

export let addSpot = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

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
      totalActiveSpots: seller.activeSpots.length,
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
    if (!user) throwError('User not found', 404);

    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (spot.owner.toString() !== seller._id.toString())
      throwError('This Seller is not the owner of this Spot', 401);

    if (spot.isActive) {
      seller.activeSpots = seller.activeSpots.filter(
        (spot) => spot._id.toString() !== spotId
      );
    } else {
      seller.inactiveSpots = seller.inactiveSpots.filter(
        (spot) => spot._id.toString() !== spotId
      );
    }

    const pointToRemove = await Point.findById(spot.location);

    await spot.deleteOne();
    await pointToRemove.deleteOne();
    await seller.save();

    res.status(200).json({
      message: `Spot deleted successfully!`,
      totalActiveSpots: seller.activeSpots.length,
      activeSpots: seller.activeSpots,
      totalInactiveSpots: seller.inactiveSpots.length,
      inactiveSpots: seller.inactiveSpots
    });
  } catch (err) {
    next(err);
  }
};

export let editSpot = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.params.spotId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (seller.owner.toString() !== seller._id.toString())
      throwError('This Seller is not the owner of this Spot', 401);

    spot.addressLine1 = req.body.addressLine1;
    spot.addressLine2 = req.body.addressLine2;
    spot.nearestLandmark = req.body.nearestLandmark;
    spot.comment = req.body.comment;
    spot.location;
    spot.imagesURI = req.body.imagesURI;
    spot.pricePerHour = req.body.pricePerHour;
    spot.owner = seller._id;
    spot.availability = req.body.availability;

    await spot.save();
  } catch (err) {
    next(err);
  }
};

export let getAllSpotsBySeller = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller)
      throwError(
        `Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`,
        500
      );

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
        totalSpots: selectedData.activeSpots.length,
        seller: {
          name: user.name,
          rating: seller.cumulativeRating,
          reviews: seller.reviews
        },
        activeSpots: selectedData.activeSpots
      }
    });
  } catch (error) {
    next(error);
  }
};

export let getAllSpots = async (req, res, next) => {
  try {
    let allSpots = await User.find({ isSeller: true })
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
    if (!allSpots) throwError('No Spots/Sellers found', 404);

    res.status(200).json({
      message: 'All Spots found successfully',
      totalSpots: spots.length,
      allSpots
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
    if (!queryLng || !queryLat || !queryRadius)
      throwError('Missing lat or lng or radius in query params', 422);
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
    }).populate('owner');

    // ================ W A Y -- 3 ================
    // let spots = await Spot.find()
    //   .where('location')
    //   .near({
    //     center: centerSearchPoint,
    //     maxDistance: queryRadius/3963.2, // in miles
    //     spherical: true
    //   });

    res.status(200).json({
      message: 'Spots found successfully',
      totalSpots: spots.length,
      spots
    });
  } catch (error) {
    next(error);
  }
};
