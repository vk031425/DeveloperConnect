import { useParams } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();

  return (
    <div className="page">
      <h2>Post Details</h2>
      <p>Viewing post with ID: <b>{id}</b></p>
    </div>
  );
};

export default PostDetails;
