const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
    // Identification
    vehicleIdNumber: {
        type: String ,
        required: true
    },
    carMake: {
        type: String ,
        required: true
    },
    carModel:{
        type: String ,
        required: true
    },
    prodYear: {
        type: String ,
    }, 
    carColor:{
        type: String ,
        required: true
    },
    carMileage:{
        type: Number,
    }    
})

module.exports = mongoose.model('Car', CarSchema)