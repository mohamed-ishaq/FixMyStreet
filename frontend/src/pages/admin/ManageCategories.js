import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff'
  });

  // Mock data for now
  useEffect(() => {
    setCategories([
      { id: 1, name: 'Road Damage', description: 'Potholes, damaged roads', color: '#dc3545', issue_count: 15 },
      { id: 2, name: 'Street Lighting', description: 'Broken street lights', color: '#ffc107', issue_count: 8 },
      { id: 3, name: 'Garbage', description: 'Waste management issues', color: '#28a745', issue_count: 12 },
      { id: 4, name: 'Water Supply', description: 'Water leakage, contamination', color: '#17a2b8', issue_count: 6 }
    ]);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      // Update logic
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      ));
    } else {
      // Add logic
      const newCategory = {
        id: categories.length + 1,
        ...formData,
        issue_count: 0
      };
      setCategories([...categories, newCategory]);
    }
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#007bff' });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Manage Categories</h1>
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', color: '#007bff' });
              setShowModal(true);
            }}
          >
            <FaPlus /> Add Category
          </button>
        </div>

        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-header" style={{ backgroundColor: category.color }}>
                <h3>{category.name}</h3>
              </div>
              <div className="category-body">
                <p>{category.description}</p>
                <div className="category-stats">
                  <span>Issues: {category.issue_count}</span>
                </div>
              </div>
              <div className="category-actions">
                <button onClick={() => handleEdit(category)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(category.id)} className="delete-btn">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCategory ? 'Update' : 'Add'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;