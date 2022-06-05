import User from '../models/user.js';
import Chat from '../models/chat.js';
import Message from '../models/message.js';
import { throwError } from '../helpers/helperfunctions.js';

export const createChat = async (req, res, next) => {
  console.log('createChat');
  try {
    const { userId } = req;
    const { sellerId } = req.body;

    let user = await User.findById(userId);
    if (!user) throwError('User not found', 404);

    let seller = await User.find({ seller: sellerId });
    if (!seller) {
      throwError('The Seller doesnt exist', 404);
    }

    const chat = await Chat.findOne({
      $and: [{ userA: user.parker }, { userB: sellerId }]
    });

    let chatId = '';

    if (chat) {
      chatId = chat._id;
    } else {
      const newChat = new Chat({
        userA: user.parker,
        userB: sellerId
      });
      await newChat.save();

      chatId = newChat._id;
    }

    res.status(200).json({ chatId, message: 'Chat Created' });
  } catch (error) {
    next(error);
  }
};

export const getChat = async (req, res, next) => {
  const chatId = req.params.chatId;
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throwError("This chat doesn't exist", 404);
  }

  const modifiedChat = await chat.populate('messages');

  res.status(200).json({ chat: modifiedChat, message: 'Chat Found' });
};

export const getChatsById = async (req, res, next) => {
  const { userId } = req;

  const user = await User.findById(userId);

  let id;
  if (user.currentRoleParker) {
    id = user.parker;
  } else {
    id = user.seller;
  }

  async function getUser(id) {
    const user = await User.findOne({
      $or: [{ parker: id }, { seller: id }]
    });

    return user;
  }

  const chatsWithUserB = await Chat.find({ userA: id });
  const modifiedchatsWithUserB = await Promise.all(
    chatsWithUserB.map(async (chat) => {
      try {
        const user = await getUser(chat.userB);
        return {
          _id: chat._id,
          receiver: user,
          messages: chat.messages
        };
      } catch (error) {
        next(error);
      }
    })
  );

  const chatsWithUserA = await Chat.find({ userB: id });
  const modifiedchatsWithUserA = await Promise.all(
    chatsWithUserA.map(async (chat) => {
      try {
        const user = await getUser(chat.userA);
        return {
          _id: chat._id,
          receiver: user,
          messages: chat.messages
        };
      } catch (error) {
        next(error);
      }
    })
  );

  const chats = [...modifiedchatsWithUserB, ...modifiedchatsWithUserA];

  const modifiedChats = await Promise.all(
    chats.map(async (chat) => {
      try {
        const lastMessageId = chat.messages[chat.messages.length - 1];
        const lastMessage = await Message.findById(lastMessageId);

        return {
          _id: chat._id,
          receiver: chat.receiver,
          messages: chat.messages,
          lastMessage: lastMessage
        };
      } catch (error) {
        next(error);
      }
    })
  );

  res.status(200).json({ chats: modifiedChats, message: 'Chats Found' });
};

export const updateChat = async (req, res, next) => {
  console.log('updateChat');
};

export const deleteChat = async (req, res, next) => {
  console.log('deleteChat');
};
