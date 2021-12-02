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
  email: {
    type: String
  },
  password: {
    type: String,
    required: true
  },

  // =======================| Attachments |====>

  cars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Cars'
    }
  ],
  spots: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Spots'
    }
  ],

  // =======================| State |====>

  isParker: Boolean,
  isSeller: Boolean,
  currentRole: {
    type: String,
    enum: Role,
    default: Role.PARKER
  }
});

export default mongoose.model('User', userSchema);
