import Post from "../models/Post.js";

// 📝 Create new post
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const post = await Post.create({
      author: req.user._id,
      text,
      image,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📃 Get all posts (for feed)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❤️ Like / Unlike
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (error) {
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

    await post.populate("comments.user", "name avatar");

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete your post
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
    res.status(500).json({ message: error.message });
  }
};
