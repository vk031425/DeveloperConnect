import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

/* 🧠 Get all conversations for logged-in user */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "username avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 💬 Get all messages in a conversation */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✉️ Send a message (create conversation if missing) */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) return res.status(400).json({ message: "Missing fields" });

    // find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    // create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    // update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // add notification if not self-messaging
    if (receiverId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: receiverId,
        sender: req.user._id,
        type: "message",
      });
    }

    // populate sender for immediate response
    await message.populate("sender", "username avatar");

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
