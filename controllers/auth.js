import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Parker from '../models/parker.js';
import Seller from '../models/seller.js';
import { throwError } from '../helpers/helperfunctions.js';

export let signup = async (req, res, next) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // Non required fields
  const email = req.body.email;

  try {
    const user = await User.findOne({ phone: phone });
    if (user) throwError('Phone Number already in use.', 409);

    if (!confirmPassword || !/\S/.test(confirmPassword)) throwError('Confirm Password field incorrect', 403);

    if (password !== confirmPassword) throwError('Passwords do NOT match', 403);

    const hashedPassword = await bcrypt.hash(password, 12);

    const parker = new Parker();
    await parker.save();

    const seller = new Seller();
    await seller.save();

    // save empty seller aswell because switchRole API will self destruct if the user is only a parker with a non-existing seller reference.

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      parker,
      seller
    });
    await newUser.save();

    res.status(201).json({ message: 'User Registered!' });
  } catch (err) {
    next(err);
  }
};

export let login = async (req, res, next) => {
  const phone = req.body.phone;
  const password = req.body.password;

  try {
    const user = await User.findOne({ phone: phone });
    if (!user) throwError('User not found', 404);

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) throwError('Wrong Password!', 401);

    // If everything checks out, send back JWT and the message we wish to send.
    // TOKEN ===================================
    const token = jwt.sign(
      {
        name: user.name,
        userId: user._id.toString()
      },
      'secretkey',
      { expiresIn: '10h' }
    );

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
      token: token,
      user: modifiedUser,
      message: 'Logged in Successfully'
    });
  } catch (err) {
    next(err);
  }
};
