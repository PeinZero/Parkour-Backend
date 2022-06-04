import { Server } from 'socket.io';

const io = new Server(5001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
});

export default io;
