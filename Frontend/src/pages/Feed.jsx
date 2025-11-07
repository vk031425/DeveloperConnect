import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all posts
  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching feed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Handle new post added
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handle like toggle
  const handleLikeToggle = (postId, liked, likesCount) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, likes: liked ? [...p.likes, "you"] : p.likes.slice(0, -1) }
          : p
      )
    );
  };

  // Handle new comment added
  const handleCommentAdded = (postId, updatedComments) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, comments: updatedComments } : p
      )
    );
  };

  return (
    <div className="page">
      <h2>Feed</h2>
      <CreatePostForm onPostCreated={handlePostCreated} />
      {loading ? (
        <p>Loading feed...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to share!</p>
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
  );
};

export default Feed;
