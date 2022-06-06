import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import PointData from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { throwError } from '../helpers/helperfunctions.js';
import bcrypt from 'bcrypt';

const Point = PointData.Point;

// make switch role API to
export const switchRole = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    let modifiedUser;

    if (!user.currentRoleParker) {
      user.currentRoleParker = true;
      user.isParker = true;
      modifiedUser = await user.populate({
        path: 'parker',
        populate: {
          path: 'defaultCar cars reviews.author'
          // bookingRequests left, figure it out
        }
      });
      delete modifiedUser.seller;
    } else {
      user.currentRoleParker = false;
      user.isSeller = true;
      modifiedUser = await user.populate({
        path: 'seller',
        populate: {
          path: 'activeSpots inactiveSpots reviews.author'
        }
      });
      delete modifiedUser.parker;
    }

    await modifiedUser.save();

    res.status(200).json({
      message: "User's Role switched successfully",
      user: modifiedUser
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByRole = async (req, res, next) => {
  const roleId = req.params.roleId;

  try {
    // !Populate the review author later
    const parkerUser = await User.findOne({
      parker: roleId.toString()
    }).populate({
      path: 'parker',
      select: 'cumulativeRating reviews'
    });

    if (parkerUser) {
      res.status(200).json({
        message: 'Parker User found',
        user: parkerUser
      });
    }

    // !Populate the review author later
    const sellerUser = await User.findOne({
      seller: roleId.toString()
    }).populate({
      path: 'seller',
      select: 'cumulativeRating reviews'
    });

    if (sellerUser) {
      res.status(200).json({
        message: 'Seller User found',
        user: sellerUser
      });
    }

    if (!parkerUser && !sellerUser) {
      throwError('User not found. Does not exist.', 404);
    }
  } catch (error) {
    next(error);
  }
};

export const updateInfo = async (req, res, next) => {
  try {
    const newInfo = req.body.newInfo;
    const password = req.body.newInfo.password ? req.body.newInfo.password : null;
    if (password) {
      newInfo.password = await bcrypt.hash(password, 12);
    }
    const userId = req.userId;
    const queryOptions = {
      new: true,
      omitUndefined: true
    };

    const modifiedNewInfo = Object.fromEntries(Object.entries(newInfo).filter(([_, v]) => v != null && v != undefined && v != ''));

    User.findOneAndUpdate({ _id: userId }, modifiedNewInfo, queryOptions, (err, updatedUser) => {
      if (err) throwError(err, 500);

      console.log(updatedUser);
      res.status(200).json({
        message: 'User info updated successfully',
        user: updatedUser
      });
    });
  } catch (err) {
    next(err);
  }
};

export const rateUser = async (req, res, next) => {
  const userId = req.userId;
  const { text, providedRating, targetUserId } = req.body;
  // targetUserId is either parker or seller

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    var specialUser;
    var errorMessage;
    if (user.currentRoleParker) {
      specialUser = await Seller.findById(targetUserId);
      errorMessage = 'Target Seller not found.';
    } else {
      specialUser = await Parker.findById(targetUserId);
      errorMessage = 'Target Parker not found.';
    }
    if (!specialUser) throwError(errorMessage, 404);

    if (specialUser.numberOfRatings === 0) {
      specialUser.cumulativeRating = providedRating;
    } else {
      specialUser.cumulativeRating =
        (specialUser.cumulativeRating * specialUser.numberOfRatings + providedRating) / (specialUser.numberOfRatings + 1);
    }
    specialUser.numberOfRatings += 1;

    const newReview = {
      author: userId,
      text,
      providedRating
    };
    specialUser.cumulativeRating = Math.round(specialUser.cumulativeRating * 10) / 10;

    specialUser.reviews.push(newReview);

    await specialUser.save();

    res.status(200).json({
      message: 'User rating updated successfully',
      specialUser
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  const specialUserId = req.params.specialUserId;

  try {
    let reviews;

    if (await Seller.exists({ _id: specialUserId })) {
      reviews = await Seller.findById(specialUserId, 'numberOfRatings cumulativeRating reviews').populate('reviews.author');
    } else if (await Parker.exists({ _id: specialUserId })) {
      reviews = await Parker.findById(specialUserId, 'numberOfRatings cumulativeRating reviews').populate('reviews.author');
    }

    // let reviews = await specialUser.select('numberOfRatings cumulativeRating reviews').populate('reviews.author');

    res.status(200).json({
      message: 'User reviews found',
      cumulativeRating: reviews.cumulativeRating,
      numberOfRatings: reviews.numberOfRatings,
      reviews: reviews.reviews
    });
  } catch (error) {
    next(error);
  }
};
// ================================== DEV APIS ==================================

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    let modifiedUser;

    if (user.currentRoleParker) {
      user.currentRoleParker = true;
      user.isParker = true;
      modifiedUser = await user.populate({
        path: 'parker',
        populate: {
          path: 'defaultCar cars'
          // bookingRequests left, figure it out
        }
      });
      delete modifiedUser.seller;
    } else {
      user.currentRoleParker = false;
      user.isSeller = true;
      modifiedUser = await user.populate({
        path: 'seller',
        populate: {
          path: 'activeSpots inactiveSpots'
        }
      });
      delete modifiedUser.parker;
    }

    res.status(200).json({
      message: 'User fetched successfully!',
      user: modifiedUser
    });
  } catch (error) {
    next(error);
  }
};
