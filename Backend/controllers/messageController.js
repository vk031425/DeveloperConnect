import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { sendMessageToUser, sendNotification } from "../socket/socketHandler.js";

/* 🧠 Get all conversations for logged-in user */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate({
        path: "participants",
        select: "username avatar name",
      })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* 💬 Get all messages in a conversation */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    // ✅ Auto-mark messages as read when fetching
    await Message.updateMany(
      { conversation: req.params.id, read: false, sender: { $ne: req.user._id } },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✉️ Send a message (create conversation if missing) */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text)
      return res.status(400).json({ message: "Missing fields" });

    // ✅ Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    // ✅ Create the new message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    // ✅ Update conversation’s last message
    conversation.lastMessage = message._id;
    await conversation.save();

    // ✅ Populate sender & conversation
    await message.populate("sender", "username avatar");
    await conversation.populate("participants", "username avatar name");

    // ✅ Send the message to the receiver instantly
    sendMessageToUser(receiverId, {
      ...message.toObject(),
      conversation: conversation._id,
    });

    // 🚫 No Notification in DB for message
    // 🟢 Instead, send a lightweight real-time alert
    sendNotification(receiverId, {
      type: "message-alert",
      sender: req.user,
      conversation: conversation._id,
      text: message.text,
      createdAt: new Date(),
    });

    res.status(201).json({
      ...message.toObject(),
      conversation: conversation._id,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✅ Mark all messages in a conversation as read */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.updateMany(
      { conversation: id, read: false, sender: { $ne: req.user._id } },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: err.message });
  }
};
