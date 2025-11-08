import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { sendNotification } from "../socket/socketHandler.js"; // ✅ clean socket import

// 🟢 Create new post
export const createPost = async (req, res) => {
  try {
    console.log("Received text:", req.body.text);
    console.log("Received file:", req.file ? req.file.path : "No file");
    const { text } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Cloudinary gives full URL

    const newPost = new Post({
      text,
      image: imageUrl,
      author: req.user._id,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get all posts (Feed)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username name email avatar")
      .populate("comments.user", "username name avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❤️ Like / Unlike Post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);

      // ✅ Create like notification only if not liking own post
      if (post.author.toString() !== userId.toString()) {
        const notif = await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id,
        });

        // ⚡ Send real-time notification
        sendNotification(post.author, notif);
      }
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 💬 Add comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: req.user._id, text: req.body.text };
    post.comments.push(comment);
    await post.save();

    await post.populate("comments.user", "username name avatar");

    // ✅ Notify post author about comment (if not commenting on own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });

      sendNotification(post.author, notif);
    }

    res.json(post.comments);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete post (only your own)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: error.message });
  }
};
