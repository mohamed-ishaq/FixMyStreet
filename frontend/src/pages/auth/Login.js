import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaUser, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Demo credentials
  const demoCredentials = {
    user: {
      email: 'user@example.com',
      password: 'user123',
      label: 'User Account'
    },
    admin: {
      email: 'admin@example.com',
      password: 'admin123',
      label: 'Admin Account'
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      
      if (response && response.success) {
        const userRole = response.user?.role;
        console.log('Login successful, role:', userRole);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin');
            toast.success('Welcome Admin!');
          } else {
            navigate('/dashboard');
            toast.success('Login successful!');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is already toasted by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    setUserType(type);
    setFormData({
      email: demoCredentials[type].email,
      password: demoCredentials[type].password
    });
    setErrors({});
  };

  return (
    <div className="auth-wrapper">
      {/* Left Side - Branding/Illustration */}
      <div className="auth-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="brand-title">Civic Issues Platform</h1>
          <p className="brand-description">
            Join your community in making a difference. Report issues, track progress, and help improve your neighborhood.
          </p>
          
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <h4>Report Issues</h4>
                <p>Easily report civic problems in your area</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <h4>Track Progress</h4>
                <p>Follow the status of reported issues</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <h4>Community Impact</h4>
                <p>See how your reports make a difference</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials Card */}
          <div className="demo-credentials">
            <h4>Demo Credentials</h4>
            <div className="demo-buttons">
              <button 
                className={`demo-btn user ${userType === 'user' ? 'active' : ''}`}
                onClick={() => fillDemoCredentials('user')}
              >
                <FaUser /> User Demo
                <small>user@example.com / user123</small>
              </button>
              <button 
                className={`demo-btn admin ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => fillDemoCredentials('admin')}
              >
                <FaUserShield /> Admin Demo
                <small>admin@example.com / admin123</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Please select your account type and sign in</p>
          </div>

          {/* User Type Tabs */}
          <div className="user-type-tabs">
            <button
              type="button"
              className={`tab-btn ${userType === 'user' ? 'active' : ''}`}
              onClick={() => {
                setUserType('user');
                setFormData({ email: '', password: '' });
                setErrors({});
              }}
            >
              <FaUser /> User Login
            </button>
            <button
              type="button"
              className={`tab-btn ${userType === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setUserType('admin');
                setFormData({ email: '', password: '' });
                setErrors({});
              }}
            >
              <FaUserShield /> Admin Login
            </button>
          </div>

          {/* User Type Indicator */}
          <div className={`user-type-indicator ${userType}`}>
            {userType === 'admin' ? (
              <>Logging in as <strong>Administrator</strong></>
            ) : (
              <>Logging in as <strong>Community Member</strong></>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={`Enter ${userType} email`}
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Password
              </label>
              <div className="input-wrapper password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={`Enter ${userType} password`}
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> 
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`auth-button ${userType}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {userType === 'admin' ? 'Admin' : 'User'}
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/register" className="register-link">
              Create an account
              <FaArrowRight />
            </Link>
          </div>

          <div className="auth-divider">
            <span>Quick Access</span>
          </div>

          <div className="quick-access">
            <button 
              type="button"
              className="quick-btn user"
              onClick={() => fillDemoCredentials('user')}
            >
              <FaUser /> User Demo
            </button>
            <button 
              type="button"
              className="quick-btn admin"
              onClick={() => fillDemoCredentials('admin')}
            >
              <FaUserShield /> Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;