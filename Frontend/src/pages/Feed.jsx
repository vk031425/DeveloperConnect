import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";
import { useAuth } from "../context/AuthContext"; // ✅ for current user
import "../styles/Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // ✅ logged-in user info

  // 🔄 Fetch all posts for the feed
  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data.reverse()); // newest first
    } catch (err) {
      console.error("Error fetching feed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // 🆕 Handle new post added
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // ❤️ Handle like toggle (frontend + backend sync)
  const handleLikeToggle = (postId, liked, likesCount) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;

        // ✅ Properly update likes array
        let updatedLikes;
        if (liked) {
          // add this user’s ID if not already in array
          updatedLikes = p.likes.includes(user._id)
            ? p.likes
            : [...p.likes, user._id];
        } else {
          // remove this user’s ID
          updatedLikes = p.likes.filter((id) => id !== user._id);
        }

        return {
          ...p,
          likes: updatedLikes,
          likesCount: likesCount || updatedLikes.length, // ✅ keep frontend count in sync
        };
      })
    );
  };

  // 💬 Handle new comment added
  const handleCommentAdded = (postId, updatedComments) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, comments: updatedComments } : p
      )
    );
  };

  return (
    <div className="feed-wrapper">
      <div className="feed-header">
        <h2>Feed</h2>
      </div>

      <div className="feed-create">
        <CreatePostForm onPostCreated={handlePostCreated} />
      </div>

      <div className="feed-content">
        {loading ? (
          <p className="feed-status">Loading feed...</p>
        ) : posts.length === 0 ? (
          <p className="feed-status">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLikeToggle={handleLikeToggle}
              onCommentAdded={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
