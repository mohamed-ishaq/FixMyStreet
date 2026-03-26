import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaArrowRight,
  FaUserShield
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);

      if (response && response.success) {
        toast.success(response.message || 'Registration successful! Please login.');
        // Redirect to login page instead of dashboard
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already toasted by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setFormData({
      username: 'demouser',
      full_name: 'Demo User',
      email: 'user@example.com',
      password: 'user123',
      confirmPassword: 'user123',
      phone: '+1234567890',
      address: '123 Demo Street, City'
    });
  };

  const fillDemoAdmin = () => {
    setFormData({
      username: 'demoadmin',
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      confirmPassword: 'admin123',
      phone: '+1987654321',
      address: '456 Admin Avenue, City'
    });
  };

  return (
    <div className="auth-wrapper">
      {/* Left Side - Branding */}
      <div className="auth-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="brand-title">Join Our Community</h1>
          <p className="brand-description">
            Create an account to start reporting civic issues and making a difference in your neighborhood.
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
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="auth-form-container">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join our civic issues platform</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">
                  <FaUser className="input-icon" />
                  Username *
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={errors.username ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="full_name">
                  <FaUser className="input-icon" />
                  Full Name *
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.full_name ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.full_name && <span className="error-message">{errors.full_name}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Email Address *
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock className="input-icon" />
                  Password *
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock className="input-icon" />
                  Confirm Password *
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <FaPhone className="input-icon" />
                Phone Number (Optional)
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'error' : ''}
                  disabled={loading}
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt className="input-icon" />
                Address (Optional)
              </label>
              <div className="input-wrapper">
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                  className={errors.address ? 'error' : ''}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Register
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="register-link">
              Sign in here
              <FaArrowRight />
            </Link>
          </div>

          <div className="auth-divider">
            <span>Quick Fill</span>
          </div>

          <div className="quick-access">
            <button
              type="button"
              className="quick-btn user"
              onClick={fillDemoUser}
            >
              <FaUser /> Demo User
            </button>
            <button
              type="button"
              className="quick-btn admin"
              onClick={fillDemoAdmin}
            >
              <FaUserShield /> Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;