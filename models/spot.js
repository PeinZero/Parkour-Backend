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
        type: String
        // required: true
      }
    ],
    pricePerHour: {
      type: Number,
      required: true
    },

    // =======================| References |====>

    spotOwner: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },

    spotBooker: {
      type: Schema.Types.ObjectId,
      ref: 'Parker'
    },

    // remember the story:
    /* 
        User selects a spot on map
        User selects a time slot
        API receives ParkerId, SpotId, StartTime, EndTime
        API creates a new BookingRequest
        API pushes the new BookingRequest to the Spot with the SpotId

    */
    bookingRequests: [
      {
        ref: 'BookingRequests',
        type: Schema.Types.ObjectId
      }
    ],

    // =======================| State |====>

    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true }, // used to hide spot from map when spot is confirmed as 'booked'
    isBooked: { type: Boolean, default: false },
    bookingExpireTime: Date, // booking should be ended by user after this time
    actualBookingEndTime: Date, // actual time the booking was ended by user

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
