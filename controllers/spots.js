import User from '../models/user.js';
import Spot from '../models/spot.js';
import BookingRequest from '../models/bookingRequest.js';
import PointData from '../models/point.js';
import Seller from '../models/seller.js';
import { throwError } from '../helpers/helperfunctions.js';

const Point = PointData.Point;
const SAFE_DISTANCE = 3; // in meters

// TODO:

export let add = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    const location = new Point({ coordinates: req.body.location });
    await location.save();

    let nearbySpots = await Spot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: req.body.location
          },
          $maxDistance: SAFE_DISTANCE // in meters
        }
      },
      isActive: true
    });

    if (nearbySpots.length > 0) throwError('A spot already exists at this location.', 409);

    const spot = new Spot({
      spotName: req.body.spotName,
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

    await spot.save();
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

export let remove = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.params.spotId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);
    if (spot.owner.toString() !== seller._id.toString()) throwError('This Seller is not the owner of this Spot', 401);

    if (spot.isActive) {
      seller.activeSpots = seller.activeSpots.filter((spot) => spot._id.toString() !== spotId);
    } else {
      seller.inactiveSpots = seller.inactiveSpots.filter((spot) => spot._id.toString() !== spotId);
    }

    const pointToRemove = await Point.findById(spot.location);
    const deletedRequests = await BookingRequest.deleteMany({
      spot: spot._id,
      status: { $ne: 'past' }
    });

    await spot.deleteOne();
    await pointToRemove.deleteOne();
    await seller.save();

    res.status(200).json({
      message: `Spot deleted successfully! ${deletedRequests} active 'Booking Requests' deleted.`,
      totalActiveSpots: seller.activeSpots.length,
      activeSpots: seller.activeSpots,
      totalInactiveSpots: seller.inactiveSpots.length,
      inactiveSpots: seller.inactiveSpots
    });
  } catch (err) {
    next(err);
  }
};

export let edit = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.params.spotId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (spot.owner.toString() !== seller._id.toString()) throwError('This Seller is not the owner of this Spot', 401);

    let nearbySpots = await Spot.find({
      _id: { $ne: spotId },
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: req.body.location
          },
          $maxDistance: SAFE_DISTANCE // in meters
        }
      }
    });

    if (nearbySpots.length > 0) throwError(`A spot already exists within ${SAFE_DISTANCE} meters of that spot`, 409);

    spot.spotName = req.body.spotName;
    spot.addressLine1 = req.body.addressLine1;
    spot.addressLine2 = req.body.addressLine2;
    spot.nearestLandmark = req.body.nearestLandmark;
    spot.comment = req.body.comment;
    spot.location.coordinates = req.body.location;
    spot.imagesURI = req.body.imagesURI;
    spot.pricePerHour = req.body.pricePerHour;
    spot.owner = seller._id;
    spot.availability = req.body.availability;

    await spot.save();

    res.status(200).json({
      message: `Spot edited successfully!`,
      spot
    });
  } catch (err) {
    next(err);
  }
};

export let getSpotsBySeller = async (req, res, next) => {
  const userId = req.userId;
  let filter = req.query.filter;
  let message,
    selector = {};

  try {
    if (!filter) throwError(`Missing Query Param: "filter"`, 400);
    filter = filter.toString();

    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller).populate('reviews');
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    selector.owner = user.seller.toString();

    if (filter === '1') {
      selector.isActive = true;
      message = 'Active Spots fetched successfully';
    } else if (filter === '-1') {
      selector.isActive = false;
      message = 'InActive Spots fetched successfully';
    } else if (filter === '0') {
      message = 'All spots fetched successfully';
    } else {
      throwError("Invalid value for query param 'filter'", 422);
    }

    const selectedSpots = await Spot.find(selector);

    res.status(200).json({
      message,
      totalSpots: selectedSpots.length,
      spots: selectedSpots
      // seller: {
      //   name: user.name,
      //   phone: user.phone,
      //   rating: seller.cumulativeRating,
      //   reviews: seller.reviews
      // },
    });
  } catch (error) {
    next(error);
  }
};

export let getSpotsByRadius = async (req, res, next) => {
  const queryLng = req.query.lng;
  const queryLat = req.query.lat;
  const queryRadius = req.query.radius; // is in kilometers, the mongoose function requires meters
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) throwError('User not found', 404);
    if (!queryLng || !queryLat || !queryRadius) throwError('Missing lat or lng or radius in query params', 422);
    if (!user.currentRoleParker) throwError('User is not a parker', 403);

    const centerSearchPoint = [queryLng, queryLat];

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
      },
      isActive: true
    }).populate('owner');

    let seller = await Seller.findById(user.seller);
    if (seller) {
      // if the user is a Seller aswell, then filter out his own spots.
      spots = spots.filter((spot) => spot.owner._id.toString() !== seller._id.toString());
    }

    // console.log(spots);

    res.status(200).json({
      message: 'Spots found successfully',
      totalSpots: spots.length,
      spots
    });
  } catch (error) {
    next(error);
  }
};

export let switchStatus = async (req, res, next) => {
  const userId = req.userId;
  const spotId = req.params.spotId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
    if (user.currentRoleParker) throwError('User is not a Seller', 403);

    const seller = await Seller.findById(user.seller);
    if (!seller) throwError(`Internal Server Error: User has a currentRole "Seller" flag but doesn't contain 'Seller' information`, 500);

    const spot = await Spot.findById(spotId);
    if (!spot) throwError('Spot not found', 404);

    if (spot.owner.toString() !== seller._id.toString()) throwError('This Seller is not the owner of this Spot', 401);

    spot.isActive = !spot.isActive;
    await spot.save();

    res.status(200).json({
      message: `Spot status changed successfully!`,
      isActive: spot.isActive
    });
  } catch (err) {
    next(err);
  }
};
