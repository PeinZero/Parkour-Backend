import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CarSchema = new Schema(
  {
    // =======================| Identification |====>

    carNumberPlate: {
      type: String,
      required: true
    },
    carMake: {
      type: String,
      required: true
    },
    carModel: {
      type: String,
      required: true
    },
    carColor: {
      type: String,
      required: true
    },
    prodYear: {
      type: String
    },
    carMileage: {
      type: Number
    },

    // =======================| Owner Reference |====>

    carOwner: {
      type: Schema.Types.ObjectId,
      ref: 'Parker'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Car', CarSchema);
