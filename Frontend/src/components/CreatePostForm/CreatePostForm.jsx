import { useState } from "react";
import api from "../../api/axiosConfig";
import "./CreatePostForm.css";

const CreatePostForm = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

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
      setPreview(null);
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
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
        />
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="preview" />
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm;
