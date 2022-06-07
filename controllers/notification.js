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
    let notifications = [];

    const notificationData = await Notification.findOne({ user: userId });
    if (!notificationData) {
      res.status(200).json({ message: 'No notifications found', notifications });
    } else {
      if (filter !== 'All') {
        notifications = notificationData.notifications.filter((not) => {
          if (not.target === filter) {
            return not;
          }
        });
      } else {
        notifications = notificationData.notifications;
      }

      res.status(200).json({
        message: 'Notifications found',
        notifications
      });
    }
  } catch (err) {
    next(err);
  }
};
