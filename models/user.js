const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Role = {
    PARKER: 'parker',
    SELLER: 'seller',
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    isParker: Boolean,
    isSeller: Boolean,
    currentRole: {
        type: String,
        enum: Role,
        default: Role.PARKER
    },
    cars: {
        type: Schema.Types.ObjectId,
        ref: 'Cars'
    },
    spots: {
        type: Schema.Types.ObjectId,
        ref: 'Spots'
    },
})

module.exports = mongoose.model('User', userSchema)