import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  message: String,
  time: String
});

export default mongoose.model('Message', messageSchema);
