import { sendMessage } from './chatHelpers';

export const socketHandler = (socket) => {
  sendMessage(socket);
};
