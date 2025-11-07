import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));

    try {
      const res = await api.put("/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.user);
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile");
    }
  };

  if (!user) return <p>Please login to access dashboard.</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {!editing ? (
        <div className="profile-card">
          <img
            src={profile.avatar || "https://via.placeholder.com/120"}
            alt="avatar"
            className="avatar"
          />
          <h3>{profile.name}</h3>
          <p>{profile.bio}</p>
          <p>
            <b>Skills:</b> {profile.skills?.join(", ")}
          </p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="form profile-form"
          encType="multipart/form-data"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            value={form.bio || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills || ""}
            onChange={(e) =>
              setForm({ ...form, skills: e.target.value.split(",") })
            }
          />
          <input
            type="text"
            name="github"
            placeholder="GitHub URL"
            value={form.github || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="linkedin"
            placeholder="LinkedIn URL"
            value={form.linkedin || ""}
            onChange={handleChange}
          />
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(e) => setForm({ ...form, avatar: e.target.files[0] })}
          />
          <button type="submit">Save</button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default Dashboard;
