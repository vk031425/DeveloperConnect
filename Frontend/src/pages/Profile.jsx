import { useParams } from "react-router-dom";

const Profile = () => {
  const { username } = useParams();

  return (
    <div className="page">
      <h2>Profile Page</h2>
      <p>Viewing profile of: <b>{username}</b></p>
    </div>
  );
};

export default Profile;
