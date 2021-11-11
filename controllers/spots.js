import User from '../models/user.js';
import Spot from '../models/spot.js';

export let registerSpot = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }

    let spot = new Spot({
      // ADD SPOT DATA HERE
    });

    // adding spot
    await spot.save();

    // adding spot to user
    user.spots.push(spot);
    await user.save();
  } catch (err) {
    next(err);
  }
};

export let getRegisteredCars = async (req, res, next) => {
  // if (car.populated) check --- DONT REMOVE THIS COMMENT
};
