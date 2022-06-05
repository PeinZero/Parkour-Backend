import { Timestamp } from 'bson';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = {
  PARKER: 'parker',
  SELLER: 'seller'
};

const userSchema = new Schema(
  {
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
    credit: {type: Number, default: 0 },
    email: { type: String, default: null },
    gender: { type: Boolean, default: null },
    DOB: { type: Date, default: null },

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

    isParker: { type: Boolean, default: true },
    isSeller: { type: Boolean, default: false }, // to change the text on the button from either "Become a Seller" or "Switch to Seller Panel"
    currentRoleParker: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);