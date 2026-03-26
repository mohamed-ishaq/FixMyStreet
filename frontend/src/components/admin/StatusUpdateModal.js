import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StatusUpdateModal = ({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  existingResolvedImageUrl
}) => {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [updateText, setUpdateText] = useState('');
  const [resolvedImage, setResolvedImage] = useState(null);
  const [resolvedImagePreview, setResolvedImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus || 'pending');
      setUpdateText('');
      setResolvedImage(null);
      setResolvedImagePreview('');
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG, PNG, GIF and WEBP images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setResolvedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setResolvedImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!updateText.trim()) {
      toast.error('Please provide an update message');
      return;
    }

    if (status === 'resolved' && !resolvedImage && !existingResolvedImageUrl) {
      toast.error('Please upload a solved proof image');
      return;
    }

    const formData = new FormData();
    formData.append('status', status);
    formData.append('update_text', updateText.trim());

    if (resolvedImage) {
      formData.append('resolved_image', resolvedImage);
    }

    setSubmitting(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      // Parent callback handles API error toast messaging.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Issue Status</h3>
          <button onClick={onClose} className="modal-close" type="button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-control"
              disabled={submitting}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label>Update Message</label>
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              rows="4"
              placeholder="Provide details about this status update..."
              className="form-control"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label>Solved Proof Image {status === 'resolved' ? '(Required)' : '(Optional)'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
              disabled={submitting}
            />
            {existingResolvedImageUrl && !resolvedImagePreview && (
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Existing solved image is already attached.</p>
            )}
            {resolvedImagePreview && (
              <img
                src={resolvedImagePreview}
                alt="Solved proof preview"
                style={{ marginTop: '10px', maxWidth: '100%', borderRadius: '8px' }}
              />
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
