import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getIssueById, addComment } from '../../services/issueService';
import { updateIssueStatus } from '../../services/adminService';
import CommentSection from '../../components/issues/CommentSection';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaClock, FaImage, FaPhone } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching issue details for ID:', id);
      const response = await getIssueById(id);
      console.log('Issue details response:', response);
      
      // Handle different response structures
      let issueData = null;
      if (response && response.success && response.data) {
        issueData = response.data;
      } else if (response && response.issue) {
        issueData = response.issue;
      } else if (response && response.data) {
        issueData = response.data;
      } else if (response) {
        issueData = response;
      }
      
      if (issueData && issueData.id) {
        setIssue(issueData);
      } else {
        console.error('Invalid issue data format:', response);
        setError('Failed to load issue details');
        toast.error('Failed to load issue details');
      }
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
      setError(error.response?.data?.message || 'Failed to fetch issue details');
      toast.error('Failed to fetch issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (comment) => {
    try {
      const response = await addComment(id, { comment });
      console.log('Add comment response:', response);
      
      if (response && response.success) {
        // Refresh the issue to get updated comments
        await fetchIssueDetails();
        toast.success('Comment added successfully');
      } else {
        toast.error(response?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleStatusUpdate = async (statusData) => {
    try {
      await updateIssueStatus(id, statusData);
      await fetchIssueDetails();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

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

  if (loading) {
    return (
      <div className="issue-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="issue-details-page">
        <div className="error-container">
          <h2>Error Loading Issue</h2>
          <p>{error || 'Issue not found'}</p>
          <button onClick={() => navigate('/issues')} className="btn-primary">
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-details-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <div className="issue-details-container">
        <div className="issue-header">
          <h1 className="issue-title">{issue.title || 'Untitled Issue'}</h1>
          <div className="issue-badges">
            <span 
              className="status-badge-large"
              style={{ backgroundColor: getStatusColor(issue.status) }}
            >
              {issue.status?.replace('_', ' ') || 'Unknown'}
            </span>
            <span 
              className="priority-badge-large"
              style={{ backgroundColor: getPriorityColor(issue.priority) }}
            >
              Priority: {issue.priority || 'Not set'}
            </span>
          </div>
        </div>

        <div className="issue-meta-info">
          <div className="meta-item">
            <FaUser /> Reported by: {issue.reporter_name || issue.user_name || 'Anonymous'}
          </div>
          <div className="meta-item">
            <FaClock /> Reported on: {issue.created_at ? format(new Date(issue.created_at), 'PPP') : 'Unknown date'}
          </div>
          <div className="meta-item">
            <FaMapMarkerAlt /> Nearby place: {issue.location || 'Not specified'}
          </div>
          <div className="meta-item">
            Address: {issue.address || 'Not provided'}
          </div>
          <div className="meta-item">
            <FaPhone /> Phone: {issue.phone || 'Not provided'}
          </div>
          <div className="meta-item">
            Pin code: {issue.pin_code || 'Not provided'}
          </div>
        </div>

        <div className="issue-category">
          Category: <span className="category-tag" style={{ backgroundColor: issue.category_color || '#007bff' }}>
            {issue.category_name || 'Uncategorized'}
          </span>
        </div>

        <div className="issue-description-full">
          <h3>Description</h3>
          <p>{issue.description || 'No description provided'}</p>
        </div>

        {issue.image_url && (
          <div className="issue-image">
            <img 
              src={getImageUrl(issue.image_url)} 
              alt="Issue" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        )}

        {issue.resolved_image_url && (
          <div className="issue-image">
            <h3><FaImage /> Solved Proof Image</h3>
            <img
              src={getImageUrl(issue.resolved_image_url)}
              alt="Solved issue proof"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        )}

        {isAdmin && (
          <div className="admin-actions">
            <button 
              onClick={() => setShowStatusModal(true)}
              className="update-status-btn"
            >
              Update Status
            </button>
          </div>
        )}

        {issue.updates && issue.updates.length > 0 && (
          <div className="issue-updates">
            <h3>Status Updates</h3>
            <div className="updates-list">
              {issue.updates.map((update) => (
                <div key={update.id} className="update-item">
                  <div className="update-header">
                    <span className="update-status" style={{ backgroundColor: getStatusColor(update.status) }}>
                      {update.status?.replace('_', ' ')}
                    </span>
                    <span className="update-time">
                      {update.created_at ? format(new Date(update.created_at), 'PPp') : 'Unknown date'}
                    </span>
                  </div>
                  <p className="update-text">{update.update_text || 'No details provided'}</p>
                  <span className="update-admin">By: {update.admin_name || 'Administrator'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <CommentSection
          issueId={id}
          comments={issue.comments || []}
          onCommentAdded={handleAddComment}
        />
      </div>

      {showStatusModal && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
          currentStatus={issue.status}
          existingResolvedImageUrl={issue.resolved_image_url}
        />
      )}
    </div>
  );
};

export default IssueDetails;
