import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = {
  PARKER: 'parker',
  SELLER: 'seller'
};

const userSchema = new Schema({
  // =======================| Identification |====>

  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: String,
  gender: Boolean,
  DOB: Date,

  // =======================| Attachments |====>
  parker: {
      type: Schema.Types.ObjectId,
      ref: 'Parker'
  },

  seller: {
      type: Schema.Types.ObjectId,
      ref: 'Seller'
  },

  // =======================| State |====>
  isParker: {type: Boolean, default: true},
  isSeller: {type: Boolean, default: true},
  currentRoleParker: {type: Boolean, default: true},

});

export default mongoose.model('User', userSchema);