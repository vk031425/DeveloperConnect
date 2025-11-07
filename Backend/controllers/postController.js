import Post from "../models/Post.js";

//Create new post
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

//Get all posts (for feed)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username name email avatar")
      .populate("comments.user", "username name avatar")
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
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Add comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: req.user._id, text: req.body.text };
    post.comments.push(comment);
    await post.save();

    await post.populate("comments.user", "username name avatar");

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
      return res
        .status(403)
        .json({ message: "You can delete only your own post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
