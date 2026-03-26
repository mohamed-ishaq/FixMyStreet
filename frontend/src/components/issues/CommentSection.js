import React, { useState } from 'react';
import { FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CommentSection = ({ issueId, comments, onCommentAdded }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ensure comments is an array
  const commentsList = Array.isArray(comments) ? comments : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      await onCommentAdded(newComment);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Comments ({commentsList.length})</h3>
      
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows="3"
          className="comment-input"
          disabled={submitting}
        />
        <button 
          type="submit" 
          className="comment-submit-btn"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {commentsList.length > 0 ? (
          commentsList.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <FaUser className="user-icon" />
                  <span className="user-name">{comment.user_name || 'Anonymous'}</span>
                  {comment.role === 'admin' && (
                    <span className="admin-badge">Admin</span>
                  )}
                </div>
                <div className="comment-time">
                  <FaClock />
                  {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Recently'}
                </div>
              </div>
              <p className="comment-text">{comment.comment || 'No comment text'}</p>
            </div>
          ))
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;