import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  // =======================| Attachments |====>
  spots: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Spots'
    }
  ],

  // =======================| Rating and Reviews |====>
  rating: {
      type: Number,
      default: 0.0
  },

  reviews: [{
      type: String
  }]
});

export default mongoose.model('Seller', sellerSchema);
