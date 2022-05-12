import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const bookingRequestsSchema = new Schema(
  {
    bookingRequestor: {
      ref: 'Parker',
      type: Schema.Types.ObjectId
    },

    spotOwner: {
      ref: 'Seller',
      type: Schema.Types.ObjectId
    },

    spot: {
      ref: 'Spot',
      type: Schema.Types.ObjectId
    },

    car: {
      ref: 'Car',
      type: Schema.Types.ObjectId
    },

    day: String,

    slots: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true }
      }
    ],

    // startTime: { type: Date, required: true },
    // endTime: { type: Date, required: true },

    message: String,

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'all', 'past'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('BookingRequests', bookingRequestsSchema);
