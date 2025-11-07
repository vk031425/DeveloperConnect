import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import "../styles/Profile.css";

const Profile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile info and posts
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
      // Update follower count dynamically
      setUserData((prev) => ({
        ...prev,
        followersCount: res.data.followersCount,
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
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
              <span>
                <b>{userData.followersCount || 0}</b> Followers
              </span>
              <span>
                <b>{userData.followingCount || 0}</b> Following
              </span>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`follow-btn ${isFollowing ? "following" : ""}`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-links">
          {userData.github && (
            <a href={userData.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {userData.linkedin && (
            <a href={userData.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
        </div>

        {userData.skills?.length > 0 && (
          <div className="profile-skills">
            <b>Skills:</b> {userData.skills.join(", ")}
          </div>
        )}
      </div>

      {/* Followers/Following lists for own profile */}
      {isOwnProfile && (
        <div className="followers-section">
          <h4>Followers ({userData.followers?.length || 0})</h4>
          <div className="follower-list">
            {userData.followers?.map((f) => (
              <span key={f._id} className="follower-item">
                @{f.username}
              </span>
            ))}
          </div>

          <h4>Following ({userData.following?.length || 0})</h4>
          <div className="follower-list">
            {userData.following?.map((f) => (
              <span key={f._id} className="follower-item">
                @{f.username}
              </span>
            ))}
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
