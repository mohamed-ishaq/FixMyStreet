import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyIssues } from '../../services/issueService';
import { FaPlus, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const Dashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const response = await getMyIssues();
      console.log('My issues response:', response);
      
      let issuesData = [];
      
      if (response && response.success && response.data) {
        issuesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (Array.isArray(response)) {
        issuesData = response;
      } else if (response && response.issues) {
        issuesData = response.issues;
      }
      
      setIssues(issuesData);
      
      // Calculate stats - ensure values are numbers
      const newStats = {
        total: issuesData.length,
        pending: issuesData.filter(i => i.status === 'pending').length,
        inProgress: issuesData.filter(i => i.status === 'in_progress').length,
        resolved: issuesData.filter(i => i.status === 'resolved').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch your issues:', error);
      toast.error('Failed to fetch your issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const recentIssues = issues.slice(0, 5);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome back, {user?.full_name || 'User'}!</h1>
        <p>Here's what's happening with your reported issues</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Issues</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <p className="stat-value">{stats.inProgress}</p>
        </div>
        <div className="stat-card resolved">
          <h3>Resolved</h3>
          <p className="stat-value">{stats.resolved}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/create-issue" className="action-button">
          <FaPlus /> Report New Issue
        </Link>
        <Link to="/issues" className="action-button secondary">
          View All Issues
        </Link>
      </div>

      <div className="recent-issues-section">
        <h2>Your Recent Issues</h2>
        {recentIssues.length > 0 ? (
          <div className="recent-issues-list">
            {recentIssues.map(issue => (
              <Link to={`/issues/${issue.id}`} key={issue.id} className="recent-issue-item">
                <div className="issue-info">
                  <h4>{issue.title}</h4>
                  <p className="issue-meta">
                    <FaMapMarkerAlt /> {issue.location || 'Location not specified'} • 
                    <FaClock /> {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status-badge ${issue.status}`}>
                  {issue.status?.replace('_', ' ') || 'Unknown'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="no-issues">You haven't reported any issues yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
