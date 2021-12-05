import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const SpotSchema = new Schema(
  {
    // =======================| Identification |====>

    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Point',
      required: true
    },
    imagesUrl: [
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

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },

    booker: {
      type: Schema.Types.ObjectId,
      ref: 'Parker'
    },

    /*  
        remember the story:
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
    
    availibilty: {
      monday: [{ startTime: Date, endTime: Date }],
      tuesday: [{ startTime: Date, endTime: Date }],
      wednesday: [{ startTime: Date, endTime: Date }],
      thursday: [{ startTime: Date, endTime: Date }],
      friday: [{ startTime: Date, endTime: Date }],
      saturday: [{ startTime: Date, endTime: Date }],
      sunday: [{ startTime: Date, endTime: Date }]
    },

    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true }, // used to hide spot from map when spot is confirmed as 'booked'
    isBooked: { type: Boolean, default: false },

    bookingStartTime: Date, // seller accepted a parking request at this time
    bookingEndTime: Date, // listed start time of the spot
    bookingCancellationTime: Date, // booking cancelled - who cancelled will be checked in API

    parkingStartTime: Date, // timer starts when user parks their car
    parkingExpireTime: Date, // user should un-park at this time
    actualParkingEndTime: Date, // actual time the car was removed by user

  },
  {
    timestamps: true // provides createdAt and updatedAt fields
  }
);

export default mongoose.model('Spot', SpotSchema);
