import User from "../models/User.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// ✅ Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get profile by username
export const getProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) return res.status(404).json({ message: "User not found" });

    // fetch user's posts
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username avatar");

    // determine if the logged-in user is viewing their own profile
    const isOwnProfile = req.user?._id.toString() === user._id.toString();

    // determine if logged-in user is following this user
    const isFollowing = req.user
      ? user.followers.some((f) => f._id.toString() === req.user._id.toString())
      : false;

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
      posts,
      isOwnProfile,
      isFollowing,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //Prevent following yourself
    if (targetUser._id.equals(currentUser._id)) {
      return res
        .status(400)
        .json({ message: "You cannot follow or unfollow yourself" });
    }

    const alreadyFollowing = currentUser.following.includes(targetUser._id);

    if (alreadyFollowing) {
      //Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => !id.equals(targetUser._id)
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => !id.equals(currentUser._id)
      );
    } else {
      //Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      //Create follow notification
      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: "follow",
      });
    }

    await currentUser.save();
    await targetUser.save();

    return res.json({
      message: alreadyFollowing ? "Unfollowed user" : "Followed user",
      isFollowing: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("❌ Follow toggle error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update profile (already correct)
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, github, linkedin } = req.body;
    const updates = { name, bio, github, linkedin };

    if (skills) {
      updates.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim());
    }

    if (req.file) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: error.message });
  }
};
