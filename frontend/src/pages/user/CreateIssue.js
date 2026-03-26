import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCategories, createIssue } from '../../services/issueService';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CreateIssue = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    address: '',
    location: '',
    phone: '',
    pin_code: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to report an issue');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching categories...');
      const response = await getCategories();
      console.log('📦 Categories response:', response);
      
      // Extract categories from response
      let categoriesArray = [];
      
      if (response && response.categories && Array.isArray(response.categories)) {
        categoriesArray = response.categories;
      } else if (response && response.data && Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (Array.isArray(response)) {
        categoriesArray = response;
      }
      
      console.log(`📊 Processed ${categoriesArray.length} categories:`, categoriesArray);
      
      if (categoriesArray.length > 0) {
        setCategories(categoriesArray);
        toast.success(`Loaded ${categoriesArray.length} categories`);
      } else {
        console.warn('⚠️ No categories found in response');
        setCategories([]);
        setError('No categories available. Please contact administrator.');
        toast.error('No categories available');
      }
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, GIF, and WEBP images are allowed');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to report an issue');
      navigate('/login');
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error('Please enter a nearby place');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!formData.pin_code.trim()) {
      toast.error('Please enter a pin code');
      return;
    }

    if (!/^[0-9]{6}$/.test(formData.pin_code.trim())) {
      toast.error('Please enter a valid 6-digit pin code');
      return;
    }
    
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('category_id', formData.category_id);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('address', formData.address);
      submitData.append('location', formData.location);
      submitData.append('phone', formData.phone.trim());
      submitData.append('pin_code', formData.pin_code.trim());
      submitData.append('priority', formData.priority);
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }
      
      const response = await createIssue(submitData);
      console.log('Create issue response:', response);
      
      if (response && response.success) {
        toast.success('Issue reported successfully!');
        navigate('/issues');
      } else {
        toast.error(response?.message || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to report issue');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="create-issue-page">
        <div className="form-container">
          <div className="loading-container">
            <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-issue-page">
      <div className="form-container">
        <h1>Report a Civic Issue</h1>
        <p className="form-subtitle">
          Please provide details about the issue you want to report
        </p>

        {error && (
          <div className="error-alert" style={{ 
            background: '#fee9e7', 
            color: '#dc3545', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            borderLeft: '4px solid #dc3545'
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={fetchCategories} 
              style={{ marginLeft: '10px', background: '#dc3545', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="issue-form" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="category_id">Category *</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loading || categories.length === 0}
            >
              <option value="">Select a category</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
            {categories.length === 0 && !fetchingCategories && (
              <div className="error-message" style={{ marginTop: '8px', color: '#dc3545' }}>
                ⚠️ No categories found. Please run: INSERT INTO categories...
              </div>
            )}
          </div>

          {/* Rest of the form remains the same */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title describing the issue"
              required
              maxLength="200"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              rows="5"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address of the issue"
              rows="3"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Nearby Place *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Landmark or nearby place"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin_code">Pin Code *</label>
              <input
                type="text"
                id="pin_code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                placeholder="Enter 6-digit pin code"
                required
                maxLength="6"
                inputMode="numeric"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-image-btn"
                onClick={() => document.getElementById('image').click()}
                disabled={loading}
              >
                <FaImage /> Choose Image
              </button>
              <p className="image-hint">Max size: 5MB. Supported: JPEG, PNG, GIF, WEBP</p>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || categories.length === 0}
            >
              {loading ? 'Submitting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
