import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${username}`);
        setUserData(res.data.user);
        setPosts(res.data.posts);
        setIsOwnProfile(res.data.isOwnProfile);
        setIsFollowing(res.data.isFollowing);
        setForm(res.data.user);
        setAvatarPreview(res.data.user.avatar);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    try {
      const res = await api.post(`/profile/${username}/follow`);
      setIsFollowing(res.data.isFollowing);
      setUserData((prev) => ({
        ...prev,
        followersCount: res.data.followersCount,
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleMessage = async () => {
    try {
      await api.post("/messages/send", {
        receiverId: userData._id,
        text: "👋 Hey!",
      });
      navigate("/messages", { state: { openChatWith: userData } });
    } catch (err) {
      console.error(
        "Error starting message:",
        err.response?.data || err.message
      );
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));

    try {
      const res = await api.put("/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserData(res.data.user);
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile");
    }
  };

  const handleRemoveFollow = async (targetId, type) => {
    try {
      const res = await api.post(`/profile/remove-${type}`, { targetId });
      setUserData(res.data.user);
    } catch (err) {
      console.error(
        "Error removing follow:",
        err.response?.data || err.message
      );
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.response?.data || err.message);
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!userData) return <p>Profile not found</p>;

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-wrapper">
              <img
                src={avatarPreview || "https://via.placeholder.com/120"}
                alt="avatar"
                className="avatar-img"
              />
              {isOwnProfile && (
                <label className="avatar-edit">
                  ✏️
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

            <div>
              <h1>@{userData.username}</h1>
              <div className="profile-stats">
                <span onClick={() => setShowFollowers(true)}>
                  <b>{userData.followersCount}</b> Followers
                </span>
                <span onClick={() => setShowFollowing(true)}>
                  <b>{userData.followingCount}</b> Following
                </span>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div>
              <p className="fullname">{userData.name}</p>
              <p className="bio">{userData.bio || "No bio yet."}</p>
              {userData.skills?.length > 0 && (
                <p className="skills">
                  <b>Skills:</b> {userData.skills.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="profile-top">
        {isOwnProfile ? (
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        ) : (
          <div className="action-buttons">
            <button
              onClick={handleFollowToggle}
              className={`follow-btn ${isFollowing ? "following" : ""}`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button onClick={handleMessage} className="msg-btn">
              💬 Message
            </button>
          </div>
        )}
      </div>

      {/* EDIT FORM */}
      {editing && (
        <form className="edit-form" onSubmit={handleSave}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name || ""}
            onChange={handleChange}
          />
          <textarea
            name="bio"
            placeholder="Bio"
            rows="3"
            value={form.bio || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills?.join(", ") || ""}
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
          <button type="submit" className="save-btn">
            Save Changes
          </button>
          {message && <p className="success-msg">{message}</p>}
        </form>
      )}

      {/* POSTS */}
      <div className="posts-section">
        <h3>Posts</h3>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet.</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                <PostCard post={post} />
                {isOwnProfile && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOLLOWERS / FOLLOWING MODALS */}
      {showFollowers && (
        <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Followers</h3>
            {userData.followers?.length ? (
              userData.followers.map((f) => (
                <div key={f._id} className="follow-item">
                  <Link
                    to={`/profile/${f.username}`}
                    onClick={() => setShowFollowers(false)}
                  >
                    <img
                      src={f.avatar || "https://via.placeholder.com/40"}
                      alt=""
                    />
                    <span>@{f.username}</span>
                  </Link>
                  {isOwnProfile && (
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFollow(f._id, "follower")}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No followers yet.</p>
            )}
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="modal-overlay" onClick={() => setShowFollowing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Following</h3>
            {userData.following?.length ? (
              userData.following.map((f) => (
                <div key={f._id} className="follow-item">
                  <Link
                    to={`/profile/${f.username}`}
                    onClick={() => setShowFollowing(false)}
                  >
                    <img
                      src={f.avatar || "https://via.placeholder.com/40"}
                      alt=""
                    />
                    <span>@{f.username}</span>
                  </Link>
                  {isOwnProfile && (
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFollow(f._id, "following")}
                    >
                      Unfollow
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>Not following anyone.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
