import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const parkerSchema = new Schema({
  // =======================| Attachments |====>
  cars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Car'
    }
  ],

  defaultCar: {
    // default car to be shown on a fresh "Book Spot" page
    ref: 'Car',
    type: Schema.Types.ObjectId
  },

  bookingRequests: [
    {
      ref: 'BookingRequests',
      type: Schema.Types.ObjectId
    }
  ],

  // IF A DEFAULT CAR IS DELETED, THEN ADD THE NEXT AVAILABLE CAR AS DEFAULT, IF NO CAR IS AVAILABLE THEN THINK ABOUT IT.

  // =======================| State |====>
  isInTransaction: {
    type: Boolean,
    default: false
  },

  // =======================| Rating and Reviews |====>
  cumulativeRating: {
    type: Number,
    default: -1.0
  },

  numberOfRatings: {
    type: Number,
    default: 0
  },

  reviews: [
    {
      author: {
        ref: 'User',
        type: Schema.Types.ObjectId
      },
      text: String,
      providedRating: Number
    }
  ]
});

export default mongoose.model('Parker', parkerSchema);
