import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  sendMessageToUser,
  sendNotification,
} from "../socket/socketHandler.js";
import User from "../models/User.js";

/* Get all conversations for logged-in user */
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

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          read: false,
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      }),
    );

    res.json(conversationsWithUnread);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* Get all messages in a conversation */
export const getMessages = async (req, res) => {
  try {
    const start = Date.now();

    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    const queryTime = Date.now() - start;
    console.log("DB Query Time (messages):", queryTime, "ms");

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        read: false,
        sender: { $ne: req.user._id },
      },
      { $set: { read: true } },
    );

    // Find conversation to identify the other user
    const conversation = await Conversation.findById(req.params.id);

    const receiver = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString(),
    );

    // Notify sender messages were seen
    sendMessageToUser(receiver, {
      type: "message-seen",
      conversation: req.params.id,
    });

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ✉️ Send a message (create conversation if missing) */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, t0 } = req.body;
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
      t0,
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
      t0,
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

    const unreadMessages = await Message.find({
      conversation: id,
      read: false,
      sender: { $ne: req.user._id },
    });

    await Message.updateMany(
      {
        conversation: id,
        read: false,
        sender: { $ne: req.user._id },
      },
      { $set: { read: true } },
    );

    // notify original senders
    unreadMessages.forEach((msg) => {
      sendMessageToUser(msg.sender, {
        type: "message-seen",
        conversation: id,
      });
    });

    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const markInboxSeen = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      lastMessageSeenAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("markInboxSeen error:", err);
    res.status(500).json({ message: err.message });
  }
};
