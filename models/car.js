import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CarSchema = new Schema(
  {
    // =======================| Identification |====>

    numberPlate: {
      type: String,
      required: true
    },
    make: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    prodYear: {
      type: String
    },
    mileage: {
      type: Number
    },

    // =======================| Owner Reference |====>

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Parker'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Car', CarSchema);
