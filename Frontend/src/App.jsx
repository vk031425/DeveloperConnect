import React from "react";
import {Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import PostDetails from "./pages/PostDetails";

const App =()=>{
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post/:id" element={<PostDetails />} />
      </Routes>
    </>
  )
}

export default App;