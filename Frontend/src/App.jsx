import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Feed from "./pages/Feed/Feed";
import Profile from "./pages/Profile/Profile";
import Messages from "./pages/Messages/Messages";
import PostDetails from "./pages/PostDetails";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔹 Redirect logic for "/"
const HomeRedirect = () => {
  const { authData } = useAuth();

  if (authData?.user) {
    return <Navigate to="/feed" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
