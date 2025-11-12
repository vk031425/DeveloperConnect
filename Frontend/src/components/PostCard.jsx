import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/PostCard.css";

const PostCard = ({ post, onLikeToggle, onCommentAdded, currentUser }) => {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  // 🧠 Detect if current user already liked this post
  useEffect(() => {
    if (post.likes?.some((id) => id === currentUser?._id)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [post.likes, currentUser?._id]);

  // ❤️ Like handler
  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      onLikeToggle(post._id, res.data.liked, res.data.likes);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // 💬 Comment handler (unchanged)
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      onCommentAdded(post._id, res.data);
      setCommentText("");
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-header-left">
          <img
            src={post.author?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="post-avatar"
          />
          <Link to={`/profile/${post.author?.username}`} className="post-username">
            @{post.author?.username}
          </Link>
        </div>
        <span className="post-date">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <p className="post-text">{post.text}</p>

      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt="post" className="post-image" />
        </div>
      )}

      <div className="post-actions">
        <button onClick={handleLike} className={`like-btn ${liked ? "liked" : ""}`}>
          {liked ? "❤️" : "🤍"} {post.likes?.length || 0}
        </button>
      </div>

      {/* Comments Section (unchanged) */}
      <div className="post-comments">
        <h4 className="comment-title">Comments ({post.comments?.length || 0})</h4>
        <div className="comment-list">
          {post.comments?.map((c) => (
            <div key={c._id} className="comment-item">
              <Link to={`/profile/${c.user?.username}`} className="comment-username">
                @{c.user?.username}
              </Link>
              : {c.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Posting..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;
