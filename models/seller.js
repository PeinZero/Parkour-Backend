import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  // =======================| Attachments |====>

  activeSpots: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Spots'
    }
  ],

  inactiveSpots: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Spots'
    }
  ],

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

  reviews: [{
    author: {
      ref: 'Parker',
      type: Schema.Types.ObjectId
    },
    text: String,
    providedRating: Number,
  }]
});

export default mongoose.model('Seller', sellerSchema);
