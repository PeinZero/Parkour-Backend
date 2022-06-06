import Chat from '../models/chat.js';
import Message from '../models/message.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import io from './socketSetup.js';

const socketHandler = async (socket) => {
  try{
    let userId = socket.handshake.auth.userId;

    if(userId){
      const user = await User.findById(userId);
      const {socketId} = user;

      if(socketId){
        const sockets = await io.in(socketId).fetchSockets();
        const socket = sockets[0];
        
        if(socket){
          socket.disconnect(true);
        }
      }

      user.socketId = socket.id;
      await user.save();
      console.log("User Connected with socketId: ", user.socketId);
    }

    // Event Listeners
    socket.on('JoinRoom', (chatId) => {
      console.log('Room Joined ...');
      socket.join(chatId);
    });

    socket.on('SendMessage', (data) => {
      saveMessage(data);
      socket.to(data.chatId).emit('ReceiveMessage', data);
    });

    socket.on('disconnect', (chatId) => {
      socket.leave(chatId);
    });

  }
  catch(err){
    console.log(err);
  }
};

// Methods
async function saveMessage({ chatId, message }) {
  const newMessage = new Message(message);
  await newMessage.save();

  const chat = await Chat.findById(chatId);
  chat.messages.push(newMessage);
  await chat.save();
}
export default socketHandler;
