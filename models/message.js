import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  message: String,
  time: Date
});

export default mongoose.model('Message', messageSchema);
