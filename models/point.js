const mongoose = require('mongoose');
const schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    // longitude is first in cordinates array.
    coordinates: {
      type: [Number],
      required: true
    }
});

module.exports = mongoose.Schema('Point', pointSchema);