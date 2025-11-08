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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${username}`);
        setUserData(res.data.user);
        setPosts(res.data.posts);
        setIsOwnProfile(res.data.isOwnProfile);
        setIsFollowing(res.data.isFollowing);
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

  // 💬 Start chat with this user
  const handleMessage = async () => {
    try {
      const res = await api.post("/messages/send", {
        receiverId: userData._id,
        text: "👋 Hey!",
      });
      navigate("/messages", { state: { openChatWith: userData } });
    } catch (err) {
      console.error("Error starting message:", err.response?.data || err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!userData) return <p>Profile not found</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={userData.avatar || "https://via.placeholder.com/120"}
            alt="avatar"
            className="avatar"
          />

          <div className="profile-info">
            <h2>@{userData.username}</h2>
            <h3>{userData.name}</h3>
            <p className="bio">{userData.bio || "No bio available"}</p>

            <div className="profile-stats">
              <span
                className="stat-link"
                onClick={() => setShowFollowers(true)}
              >
                <b>{userData.followersCount || 0}</b> Followers
              </span>
              <span
                className="stat-link"
                onClick={() => setShowFollowing(true)}
              >
                <b>{userData.followingCount || 0}</b> Following
              </span>
            </div>

            {!isOwnProfile && (
              <div className="profile-actions">
                <button
                  onClick={handleFollowToggle}
                  className={`follow-btn ${isFollowing ? "following" : ""}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button className="message-btn" onClick={handleMessage}>
                  💬 Message
                </button>
              </div>
            )}
          </div>
        </div>

        {userData.skills?.length > 0 && (
          <div className="profile-skills">
            <b>Skills:</b> {userData.skills.join(", ")}
          </div>
        )}
      </div>

      {/* 🧠 Followers Modal */}
      {showFollowers && (
        <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Followers</h3>
            {userData.followers?.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              userData.followers.map((f) => (
                <Link
                  key={f._id}
                  to={`/profile/${f.username}`}
                  onClick={() => setShowFollowers(false)}
                  className="follower-item"
                >
                  <img
                    src={f.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                  />
                  <span>@{f.username}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🧠 Following Modal */}
      {showFollowing && (
        <div className="modal-overlay" onClick={() => setShowFollowing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Following</h3>
            {userData.following?.length === 0 ? (
              <p>Not following anyone.</p>
            ) : (
              userData.following.map((f) => (
                <Link
                  key={f._id}
                  to={`/profile/${f.username}`}
                  onClick={() => setShowFollowing(false)}
                  className="follower-item"
                >
                  <img
                    src={f.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                  />
                  <span>@{f.username}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="user-posts">
        <h3>Posts by @{userData.username}</h3>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
