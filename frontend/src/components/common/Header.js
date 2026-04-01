import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaUser, FaPlus, FaList, FaChartBar } from 'react-icons/fa';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="nav-logo">
          <FaChartBar /> Civic Issues Platform
        </Link>
        
        <ul className="nav-menu">
          {!isAdmin ? (
            // User Navigation
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  <FaChartBar /> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/issues" className="nav-link">
                  <FaList /> All Issues
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/create-issue" className="nav-link">
                  <FaPlus /> Report Issue
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">
                  <FaUser /> {user?.full_name || 'Profile'}
                </Link>
              </li>
            </>
          ) : (
            // Admin Navigation
            <>
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  <FaChartBar /> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/issues" className="nav-link">
                  <FaList /> Manage Issues
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/users" className="nav-link">
                  <FaUser /> Manage Users
                </Link>
              </li>
            </>
          )}
          
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
