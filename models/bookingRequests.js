import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const bookingRequestsSchema = new Schema(
  {
    bookingRequestor: {
      ref: 'Parker',
      type: Schema.Types.ObjectId
    },

    car: {
      ref: 'Car',
      type: Schema.Types.ObjectId
    },

    day: String,

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    message: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model('BookingRequests', bookingRequestsSchema);
