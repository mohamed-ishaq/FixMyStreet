import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would connect to an update profile API
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <h1 className="profile-name">{user?.full_name}</h1>
          <p className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'Community Member'}</p>
        </div>

        <div className="profile-content">
          {!isEditing ? (
            // View Mode
            <>
              <div className="profile-info-group">
                <h3>Personal Information</h3>
                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div>
                    <label>Username</label>
                    <p>{user?.username}</p>
                  </div>
                </div>

                {user?.phone && (
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <div>
                      <label>Phone</label>
                      <p>{user?.phone}</p>
                    </div>
                  </div>
                )}

                {user?.address && (
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <div>
                      <label>Address</label>
                      <p>{user?.address}</p>
                    </div>
                  </div>
                )}

                <div className="info-item">
                  <FaCalendar className="info-icon" />
                  <div>
                    <label>Member Since</label>
                    <p>{format(new Date(user?.created_at || Date.now()), 'PPP')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="edit-profile-btn"
              >
                Edit Profile
              </button>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <h3>Edit Profile</h3>

              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;