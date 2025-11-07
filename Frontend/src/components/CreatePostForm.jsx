import { useState } from "react";
import api from "../api/axiosConfig";

const CreatePostForm = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/posts", { text });
      onPostCreated(res.data);
      setText("");
    } catch (err) {
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share something with the community..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm;
