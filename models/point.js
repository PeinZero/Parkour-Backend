import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    // longitude is first in cordinates array.
    coordinates: {
      type: [Number],
      required: true
    }
});

export default mongoose.model('Point', PointSchema);