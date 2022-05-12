import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import PointData from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { throwError } from '../helpers/helperfunctions.js';

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

    res.status(200).json({
      message: 'User fetched successfully!',
      user: modifiedUser
    });
  } catch (error) {
    next(error);
  }
};
