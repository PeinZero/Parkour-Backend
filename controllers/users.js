import User from '../models/user.js';
import Car from '../models/car.js';
import Spot from '../models/spot.js';
import Point from '../models/point.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import {
  checkIfObjectDoesNotExists,
  checkIfObjectExists
} from '../helpers/helperfunctions.js';

// make switch role API to
export const switchRole = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    checkIfObjectDoesNotExists(user, 'User not found');

    let modifiedUser;

    if (!user.currentRoleParker) {
      user.currentRoleParker = true;
      user.isParker = true;
      modifiedUser = await user.populate({
        path: 'parker',
        populate: {
          path: 'defaultCar'
        },
        populate: {
          path: 'cars'
        },
        populate: {
          path: 'reviews.author'
        },
        path: {
          path: 'bookingRequests'
        }
      });
      delete modifiedUser.seller;
    } else {
      user.currentRoleParker = false;
      user.isSeller = true;
      modifiedUser = await user.populate({
        path: 'seller',
        populate: {
          path: 'activeSpots'
        },
        populate: {
          path: 'inactiveSpots'
        },
        populate: {
          path: 'reviews.author'
        }
      });
      delete modifiedUser.parker;
    }

    console.log(modifiedUser);

    await modifiedUser.save();

    res.status(200).json({
      message: "User's Role switched successfully",
      user: modifiedUser
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
    checkIfObjectDoesNotExists(user, 'User not found');

    let modifiedUser = await user.populate({
      path: 'parker',
      populate: {
        path: 'cars'
      }
    });

    if (user.currentRoleParker) {
      modifiedUser = await user.populate({
        path: 'parker',
        populate: {
          path: 'reviews.author'
        },
        populate: {
          path: 'defaultCar'
        },
        populate: {
          path: 'cars'
        }
      });
      delete modifiedUser.seller;
    } else {
      modifiedUser = await user.populate({
        path: 'seller',
        populate: {
          path: 'activeSpots'
        },
        populate: {
          path: 'inactiveSpots'
        },
        populate: {
          path: 'reviews.author'
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
