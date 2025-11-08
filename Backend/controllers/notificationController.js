import Notification from "../models/Notification.js";

// ✅ Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username avatar")
      .populate("post", "image")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Mark notifications as read and return updated list
export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    // 🧠 Return updated notifications after marking as read
    const updatedNotifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "username avatar")
      .populate("post", "image")
      .sort({ createdAt: -1 });

    res.json(updatedNotifications);
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: error.message });
  }
};
