import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";
import "../styles/Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch all posts for the feed
  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts/feed");
      // Show newest first
      setPosts(res.data.reverse());
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

  // ❤️ Handle like toggle
  const handleLikeToggle = (postId, liked, likesCount) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: liked
                ? [...p.likes, "you"]
                : p.likes.filter((id) => id !== "you"),
            }
          : p
      )
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
