import { throwError } from '../helpers/helperfunctions.js';
import User from '../models/user.js';

export default async (req, res, next) => {
  console.log('isUser');

  try {
    let user = await User.findById(req.userId);
    if (!user) {
      throwError('This User doesnt exist', 404);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
