const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpotSchema = new Schema({
    // Identification
    spotName: {
        type: String ,
        required: true
    },
    spotLocation: {
        type: Schema.Types.ObjectId,
        ref: "Point",
        required: true
    },
    spotImagesUrl:[{
        type: String,
        required: true,
    }],
    spotDescription: {
        type: String,
        required: true,
    },
    pricePerHour: {
        type: Number,
        required: true,
    }, 
    spotAvailibilty:{
        required: true,
        monday: [{
            startTime: Date,
            endTime: Date,
        }],
        tuesday: [{
            startTime: Date,
            endTime: Date,
        }],
        wednesday: [{
            startTime: Date,
            endTime: Date,
        }],
        thursday: [{
            startTime: Date,
            endTime: Date,
        }],
        friday: [{
            startTime: Date,
            endTime: Date,
        }],
        saturday: [{
            startTime: Date,
            endTime: Date,
        }],
        sunday: [{
            startTime: Date,
            endTime: Date,
        }],
    },


})

module.exports = mongoose.model('Spot', SpotSchema)

