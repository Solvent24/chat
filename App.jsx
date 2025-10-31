// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import Layout from "./Layout";
import BlogFeature from "./BlogFeature";
import Chat from "./Chat";
import Login from "./Login";
import Register from "./Register";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Default route now navigates to login */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Routes with sidebar */}
            <Route element={<Layout />}>
              <Route path="/blogfeature" element={<BlogFeature />} />
              <Route path="/explore" element={<div className="content-area">Explore Page</div>} />
              <Route path="/reels" element={<div className="content-area">Reels Page</div>} />
              <Route path="/notifications" element={<div className="content-area">Notifications Page</div>} />
              <Route path="/create" element={<div className="content-area">Create Page</div>} />
              <Route path="/profile" element={<div className="content-area">Profile Page</div>} />
              <Route path="/menu" element={<div className="content-area">Menu Page</div>} />
            </Route>
            
            {/* Chat route WITHOUT sidebar */}
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;