import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const parkerSchema = new Schema({
  // =======================| Attachments |====>
  cars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Cars'
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

export default mongoose.model('Parker', parkerSchema);
