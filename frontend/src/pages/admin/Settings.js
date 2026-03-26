import React, { useState, useEffect } from 'react';
import { getCategories } from '../../services/issueService';
import { createCategory, deleteCategory, updateCategory } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#007bff'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      console.log('Categories response:', response);
      
      if (response.categories) {
        setCategories(response.categories);
      } else if (response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleInputChange = (e) => {
    setNewCategory({
      ...newCategory,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await createCategory(newCategory);
      if (response.success) {
        toast.success('Category added successfully');
        setNewCategory({
          name: '',
          description: '',
          icon: '',
          color: '#007bff'
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#007bff'
    });
  };

  const handleUpdateCategory = async (id) => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await updateCategory(id, newCategory);
      if (response.success) {
        toast.success('Category updated successfully');
        setEditingId(null);
        setNewCategory({
          name: '',
          description: '',
          icon: '',
          color: '#007bff'
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteCategory(categoryId);
      if (response.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewCategory({
      name: '',
      description: '',
      icon: '',
      color: '#007bff'
    });
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="dashboard-content">
        <h1>Settings</h1>

        <div className="settings-section">
          <h2>Manage Categories</h2>

          <form onSubmit={handleAddCategory} className="add-category-form">
            <div className="form-row">
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                placeholder="Category Name"
                required
                className="form-input"
                disabled={loading || editingId}
              />
              <input
                type="text"
                name="icon"
                value={newCategory.icon}
                onChange={handleInputChange}
                placeholder="Icon name (optional)"
                className="form-input"
                disabled={loading || editingId}
              />
              <input
                type="color"
                name="color"
                value={newCategory.color}
                onChange={handleInputChange}
                className="color-input"
                disabled={loading || editingId}
              />
              {editingId ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => handleUpdateCategory(editingId)}
                    className="save-btn"
                    disabled={loading}
                  >
                    <FaSave /> Update
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="cancel-btn"
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              ) : (
                <button type="submit" className="add-btn" disabled={loading}>
                  <FaPlus /> Add Category
                </button>
              )}
            </div>
            <textarea
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              placeholder="Category Description"
              rows="2"
              className="form-textarea"
              disabled={loading}
            />
          </form>

          <div className="categories-list">
            {categories.length > 0 ? (
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Color</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="category-icon">
                        <span style={{ color: cat.color }}>{cat.icon || '📌'}</span>
                      </td>
                      <td>{cat.name}</td>
                      <td>{cat.description || '-'}</td>
                      <td>
                        <div 
                          className="color-preview" 
                          style={{ backgroundColor: cat.color, width: '30px', height: '30px', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEditCategory(cat)}
                          className="edit-btn"
                          disabled={loading}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="delete-btn"
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-categories">No categories found. Add your first category above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;