import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Parker from '../models/parker.js';

export let signup = async (req, res, next) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Non required fields
  const email = req.body.email;

  try {

    if (!confirmPassword || !/\S/.test(confirmPassword)) {
      const error = new Error('Please confirm your password');
      error.statusCode = 403;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error('Passwords do not match');
      error.statusCode = 403;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // const parker = new Parker({
    //     rating: 5.0,
    // })

    // parker.reviews.push('What a guy!!');

    const parker = new Parker();

    await parker.save();

    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      parker
    });

    await user.save();

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

    // Checking User email
    if (!user) {
      const error = new Error('User Not Found!');
      error.statusCode = 404;
      throw error;
    }

    // Checking User password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong Password!');
      error.statusCode = 401;
      throw error;
    }

    // If everything checks out, send back JWT and the message we wish to send.
    // TOKEN ===================================
    const token = jwt.sign(
      {
        name: user.name,
        userId: user._id.toString()
      },
      'secretkey',
      { expiresIn: '1h' }
    );
    // TOKEN ===================================

    let modifiedUser;

    if (user.currentRoleParker) {
      modifiedUser = await user.populate('parker');
      delete modifiedUser.seller;
    } else {
      modifiedUser = await user.populate('seller');
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
