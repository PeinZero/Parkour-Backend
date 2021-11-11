import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SpotSchema = new Schema({
    // =======================| Identification |====>

    spotName: {
        type: String,
        required: true,
    },
    spotLocation: {
        type: Schema.Types.ObjectId,
        ref: "Point",
        required: true,
    },
    spotOwner: {
        // reference
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    spotImagesUrl: [
        {
            type: String,
            required: true,
        },
    ],
    spotDescription: {
        type: String,
        required: true,
    },
    pricePerHour: {
        type: Number,
        required: true,
    },

    // =======================| State |====>

    isActive: Boolean,

    timestamps: true, // provides createdAt and updatedAt fields
    bookingExpireTime: Date, // booking should be ended by user after this time
    bookingEndTime: Date, // actual time the booking was ended by user

    isBooked: Boolean,

    spotAvailibilty: {
        required: true,
        monday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        tuesday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        wednesday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        thursday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        friday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        saturday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
        sunday: [
            {
                startTime: Date,
                endTime: Date,
            },
        ],
    },
});

export default mongoose.model("Spot", SpotSchema);
