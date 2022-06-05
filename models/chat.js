import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  userA: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  userB: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },

  messages: [
    {
      ref: 'Message',
      type: Schema.Types.ObjectId
    }
  ]
});

export default mongoose.model('Chat', chatSchema);
