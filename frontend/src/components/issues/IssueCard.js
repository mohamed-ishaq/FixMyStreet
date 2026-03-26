import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaComment } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const IssueCard = ({ issue }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      resolved: '#28a745',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  // Safely extract values
  const commentCount = typeof issue.comment_count === 'object' 
    ? (issue.comment_count.total || issue.comment_count.count || 0) 
    : (issue.comment_count || 0);
  
  const status = issue.status || 'pending';
  const priority = issue.priority || 'medium';
  const description = issue.description || '';
  const location = issue.location || 'Location not specified';
  const reporterName = issue.reporter_name || 'Anonymous';
  const categoryName = issue.category_name || 'Uncategorized';

  return (
    <div className="issue-card">
      <div className="issue-header">
        <h3 className="issue-title">
          <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
        </h3>
        <div className="issue-badges">
          <span 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(status) }}
          >
            {status.replace('_', ' ')}
          </span>
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(priority) }}
          >
            {priority}
          </span>
        </div>
      </div>

      <p className="issue-description">
        {description.length > 150 
          ? `${description.substring(0, 150)}...` 
          : description}
      </p>

      <div className="issue-meta">
        <div className="meta-item">
          <FaMapMarkerAlt /> {location}
        </div>
        <div className="meta-item">
          <FaClock /> {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
        </div>
        <div className="meta-item">
          <FaComment /> {commentCount} comments
        </div>
      </div>

      <div className="issue-footer">
        <span className="reporter">Reported by: {reporterName}</span>
        <span className="category">Category: {categoryName}</span>
      </div>
    </div>
  );
};

export default IssueCard;