import { useState } from "react";
import api from "../api/axiosConfig";

const PostCard = ({ post, onLikeToggle, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      onLikeToggle(post._id, res.data.liked, res.data.likes);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

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
        <strong>{post.author?.name}</strong>
        <span className="post-date">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="post-text">{post.text}</p>

      {post.image && <img src={post.image} alt="post" className="post-image" />}

      <div className="post-actions">
        <button onClick={handleLike}>
          ❤️ {post.likes?.length || 0}
        </button>
      </div>

      <div className="post-comments">
        <h4>Comments ({post.comments?.length || 0})</h4>
        {post.comments?.map((c) => (
          <p key={c._id}>
            <b>{c.user?.name}: </b> {c.text}
          </p>
        ))}

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
