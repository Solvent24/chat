// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google OAuth script
    loadGoogleScript();
  }, []);

  const loadGoogleScript = () => {
    // Check if script is already loaded
    if (window.google) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);
  };

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.log('Google script not loaded');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: '1060689724401-gilv8g10i46gbgooga4cjcguhalpreus.apps.googleusercontent.com',
        callback: handleGoogleSignIn,
        auto_select: false,
      });

      // Render Google button
      const googleButton = document.getElementById('googleSignInButton');
      if (googleButton) {
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  };

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    
    try {
      // Try to call your backend
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/blogfeature');
      } else {
        // If backend fails, use demo login
        console.log('Google auth failed, using demo login');
        handleDemoLogin();
      }
    } catch (error) {
      console.error('Google sign in error, using demo login:', error);
      // Use demo login if backend is not available
      handleDemoLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Demo login - works without backend
    localStorage.setItem('token', 'demo-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Demo User',
      email: 'demo@example.com'
    }));
    navigate('/blogfeature');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Demo login - works without backend
      if (formData.email && formData.password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Demo User',
          email: formData.email
        }));
        
        navigate('/blogfeature');
      } else {
        alert('Please fill in all fields');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualGoogleLogin = () => {
    // Trigger Google sign in manually
    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    } else {
      // If Google auth not available, use demo
      handleDemoLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome Back!</h1>
          <p>Our goal is to ensure that you have everything you need to feel comfortable, confident, and ready to make an impact.</p>
          
          <div className="features">
            <div className="feature">
              <i className="fas fa-download"></i>
              <span>Free Source Files</span>
            </div>
            <div className="feature">
              <i className="fas fa-palette"></i>
              <span>Trendy Design</span>
            </div>
          </div>
          
          <button className="btn btn-primary get-started-btn">
            Get Started Free
          </button>
        </div>
        
        {/* Right Login Section */}
        <div className="login-section">
          <h2>Login Screen</h2>
          <p>Sign in to your account to continue</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>
            
            <div className="remember-forgot">
              <div className="remember">
                <input 
                  type="checkbox" 
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  &nbsp;Signing In...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="divider">or continue with</div>
          
          {/* Google Sign In Button */}
          <div id="googleSignInButton"></div>
          
          {/* Fallback Google Button */}
          <button 
            className="btn btn-google"
            onClick={handleManualGoogleLogin}
            disabled={isLoading}
            type="button"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
            />
            Continue with Google
          </button>
          
          <div className="signup-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Make sure this export is present
export default Login;