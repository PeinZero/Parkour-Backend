import User from '../models/user.js';
import { throwError } from '../helpers/helperfunctions.js';

export const createChat = async (req, res, next) => {
  console.log('createChat');
  const { user } = req;
  const { receiverId } = req.body;

  let receiver = await User.findById(receiverId);
  if (!receiver) {
    throwError('This User doesnt exist', 404);
  }

  const newChat = { user: user._id, receiver: receiver._id, messages: [] };
  await newChat.save();

  res.status(200).json({ newChat, message: 'Chat Created' });
};

export const getChat = async (req, res, next) => {
  console.log('getChat');
};

export const updateChat = async (req, res, next) => {
  console.log('updateChat');
};

export const deleteChat = async (req, res, next) => {
  console.log('deleteChat');
};
