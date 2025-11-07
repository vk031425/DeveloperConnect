import { useState } from "react";
import api from "../api/axiosConfig";

const CreatePostForm = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPostCreated(res.data);
      setText("");
      setImage(null);
    } catch (err) {
      setError("Failed to create post");
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <textarea
          placeholder="Share something with the community..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm;
