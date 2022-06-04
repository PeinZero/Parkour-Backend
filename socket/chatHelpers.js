export const sendMessage = (socket) => {
  socket.on('sendMessage', (data) => {
    console.log(data);
    socket.broadcast.emit('receiveMessage', data);
  });
};
