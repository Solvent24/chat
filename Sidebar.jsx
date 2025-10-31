import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Search, Film, Heart, PlusSquare, User, Menu, X, ChevronLeft } from "lucide-react";
import "./sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop Collapse Toggle */}
      <button className="collapse-toggle-btn" onClick={toggleCollapse}>
        <ChevronLeft 
          size={20} 
          className={isCollapsed ? 'rotate-180' : ''} 
        />
      </button>

      {/* Mobile Toggle Button */}
      <button className="mobile-toggle-btn" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <nav className="nav-links">
          <NavLink
            to="/blogfeature"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Home size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <MessageCircle size={20} />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Search size={20} />
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/reels"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Film size={20} />
            <span>Reels</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Heart size={20} />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <PlusSquare size={20} />
            <span>Create</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="more-link">
          <NavLink to="/menu" className="nav-item" onClick={() => setIsOpen(false)}>
            <Menu size={20} />
            <span>More</span>
          </NavLink>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;