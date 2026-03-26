import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/issueService';
import { getAllIssues, updateIssueStatus } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { FaSearch, FaFilter, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageIssues = () => {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchIssues();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchIssues = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAllIssues({ ...filters, page, limit: 20 });
      console.log('Issues response:', response);
      
      if (response.success) {
        setIssues(response.issues || []);
        setPagination({
          page: response.pagination?.current_page || 1,
          pages: response.pagination?.total_pages || 1,
          total: response.pagination?.total_items || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIssues(1);
  };

  const handleStatusUpdate = async (statusData) => {
    try {
      await updateIssueStatus(selectedIssue.id, statusData);
      fetchIssues(pagination.page);
      setShowStatusModal(false);
      setSelectedIssue(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
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

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="dashboard-content">
        <h1>Manage Issues</h1>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search issues..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </form>

          <div className="filter-controls">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button onClick={() => fetchIssues(1)} className="apply-filters-btn">
              <FaFilter /> Apply Filters
            </button>
          </div>
        </div>

        {/* Issues Table */}
        <div className="issues-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading issues...</p>
            </div>
          ) : (
            <table className="issues-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Reporter</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length > 0 ? (
                  issues.map(issue => (
                    <tr key={issue.id}>
                      <td>#{issue.id}</td>
                      <td>
                        <Link to={`/issues/${issue.id}`} className="issue-title-link">
                          {issue.title}
                        </Link>
                      </td>
                      <td>{issue.reporter_name}</td>
                      <td>{issue.category_name}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(issue.status) }}
                        >
                          {issue.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${issue.priority}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>{format(new Date(issue.created_at), 'MMM dd, yyyy')}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowStatusModal(true);
                          }}
                          className="action-btn"
                        >
                          <FaEdit /> Update
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">No issues found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => fetchIssues(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => fetchIssues(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showStatusModal && selectedIssue && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedIssue(null);
          }}
          onUpdate={handleStatusUpdate}
          currentStatus={selectedIssue?.status}
          existingResolvedImageUrl={selectedIssue?.resolved_image_url}
        />
      )}
    </div>
  );
};

export default ManageIssues;
