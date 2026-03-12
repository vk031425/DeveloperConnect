import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authData } = useAuth();

  if (authData.loading) {
    return <div>Loading...</div>;
  }

  if (!authData.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
