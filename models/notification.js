import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notifications: [
      {
        text : {
          type: String,
          required: true
        },
        target : {
          type: String,
          required: true
        },
        time: {
          type: Date,
          required: true
        }
      }
    ]
  }
);

export default mongoose.model('Notification', NotificationSchema);
