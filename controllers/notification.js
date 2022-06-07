import User from '../models/user.js';
import Notification from '../models/notification.js';
import { throwError } from '../helpers/helperfunctions.js';

export const get = async (req, res, next) => {
  try {
    const userId = req.userId;
    const filter = req.query.filter;

    console.log(filter);
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    const notificationData = await Notification.findOne({ user: userId });
    if (!notificationData) res.status(200).json({ message: 'No notification found', notifications: [] });
    else {
      console.log(notificationData);

      const notifications = notificationData.notifications.filter((not) => {
        if (not.target === filter) {
          return not;
        }
      });

      res.status(200).json({
        message: 'Notifications found',
        notifications
      });
    }
  } catch (err) {
    next(err);
  }
};
