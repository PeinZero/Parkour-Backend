import mongoose from 'mongoose';
import PointData from './point.js';
const Schema = mongoose.Schema;

const SpotSchema = new Schema(
  {
    // =======================| Identification |====>
    spotName: {
      type: String,
      required: true
    },

    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    nearestLandmark: String, // make it required later
    comment: String,

    location: {
      type: PointData.PointSchema,
      index: '2dsphere',
      ref: 'Point',
      required: true
    },
    imagesURI: [
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
        <==//     REMEMBER THE STORY     //==>
        User selects a spot on map
        User selects a time slot
        API receives ParkerId, SpotId, StartTime, EndTime
        API creates a new BookingRequest
        API pushes the new BookingRequest to the Spot with the SpotId
        API pushes the new BookingRequest to the Parker
    */

    bookingRequests: [
      {
        ref: 'BookingRequests',
        type: Schema.Types.ObjectId
      }
    ],

    // =======================| State |====>

    availability: [
      {
        slotDate: Date,
        slots: [
          {
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true }
          }
        ]
      }
    ],

    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true }, // used to hide spot from map when spot is confirmed as 'booked'
    isBooked: { type: Boolean, default: false },

    bookingStartTime: Date, // seller accepted a parking request at this time
    bookingEndTime: Date, // listed start time of the spot
    bookingCancellationTime: Date, // booking cancelled - who cancelled will be checked in API

    parkingStartTime: Date, // The startTime of the slot for which the parker booked the spot.
    parkingExpireTime: Date, // user should un-park at this time
    actualParkingEndTime: Date // actual time the car was removed by user
  },
  {
    timestamps: true // provides createdAt and updatedAt fields
  }
);

export default mongoose.model('Spot', SpotSchema);
