// components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  // Don't show header on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/blogfeature" className="logo">
          SocialApp
        </Link>
        
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      <nav className={`nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
        <Link 
          to="/blogfeature" 
          className={`nav-link ${location.pathname === '/blogfeature' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <i className="fas fa-blog"></i>
          Blog
        </Link>
        <Link 
          to="/explore" 
          className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <i className="fas fa-compass"></i>
          Explore
        </Link>
        <Link 
          to="/reels" 
          className={`nav-link ${location.pathname === '/reels' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <i className="fas fa-film"></i>
          Reels
        </Link>
        <Link 
          to="/chat" 
          className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <i className="fas fa-comments"></i>
          Chat
        </Link>
      </nav>

      <div className="header-actions">
        {isLoggedIn ? (
          <div className="user-menu">
            <Link 
              to="/create" 
              className="btn btn-primary create-btn"
            >
              <i className="fas fa-plus"></i>
              Create
            </Link>
            
            <div className="user-profile">
              <div className="avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{getInitials(user?.name)}</span>
                )}
              </div>
              <span className="user-name">{user?.name}</span>
              
              <div className="dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                >
                  <i className="fas fa-user"></i>
                  Profile
                </Link>
                <Link 
                  to="/notifications" 
                  className="dropdown-item"
                >
                  <i className="fas fa-bell"></i>
                  Notifications
                </Link>
                <Link 
                  to="/menu" 
                  className="dropdown-item"
                >
                  <i className="fas fa-cog"></i>
                  Settings
                </Link>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;