import Chat from '../models/chat.js';
import Message from '../models/message.js';

async function saveMessage({ chatId, message }) {
  const newMessage = new Message(message);
  await newMessage.save();

  const chat = await Chat.findById(chatId);
  chat.messages.push(newMessage);
  await chat.save();
}

const socketHandler = (socket) => {
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
};

export default socketHandler;
