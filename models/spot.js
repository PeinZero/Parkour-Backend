import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const SpotSchema = new Schema(
  {
    // =======================| Identification |====>

    spotName: {
      type: String,
      required: true
    },
    spotDescription: {
      type: String,
      required: true
    },
    spotLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Point',
      required: true
    },
    spotImagesUrl: [
      {
        type: String,
        // required: true
      }
    ],
    pricePerHour: {
      type: Number,
      required: true
    },

    // =======================| Owner Reference |====>

    spotOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // =======================| State |====>

    isActive: {type: Boolean, default: true},
    isBooked: {type: Boolean, default: false},
    bookingExpireTime: Date, // booking should be ended by user after this time
    bookingEndTime: Date, // actual time the booking was ended by user

    spotAvailibilty: {
      monday: [{ startTime: Date, endTime: Date }],
      tuesday: [{ startTime: Date, endTime: Date }],
      wednesday: [{ startTime: Date, endTime: Date }],
      thursday: [{ startTime: Date, endTime: Date }],
      friday: [{ startTime: Date, endTime: Date }],
      saturday: [{ startTime: Date, endTime: Date }],
      sunday: [{ startTime: Date, endTime: Date }]
    }
  },
  {
    timestamps: true // provides createdAt and updatedAt fields
  }
);

export default mongoose.model('Spot', SpotSchema);
