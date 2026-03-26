import React, { useState, useEffect } from 'react';
import { getIssues, getCategories } from '../../services/issueService';
import IssueList from '../../components/issues/IssueList';
import IssueFilters from '../../components/issues/IssueFilters';
import { FaMapMarkedAlt, FaList } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadCategories();
    loadIssues();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await getCategories();
      console.log('Categories loaded:', response);
      
      // Handle different response structures
      let categoriesData = [];
      if (response && response.categories) {
        categoriesData = response.categories;
      } else if (response && response.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Set default categories as fallback
      setCategories([
        { id: 1, name: 'Road Damage', color: '#dc3545' },
        { id: 2, name: 'Street Lighting', color: '#ffc107' },
        { id: 3, name: 'Garbage & Waste', color: '#28a745' },
        { id: 4, name: 'Water Supply', color: '#17a2b8' },
        { id: 5, name: 'Sewage & Drainage', color: '#6f42c1' },
        { id: 6, name: 'Public Safety', color: '#fd7e14' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadIssues = async (page = 1, newFilters = filters) => {
    setLoading(true);
    try {
      const response = await getIssues({ ...newFilters, page, limit: 10 });
      console.log('Issues loaded:', response);
      
      if (response && response.success && response.data) {
        setIssues(response.data.issues || []);
        setPagination({
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          total: response.data.total || 0
        });
      } else if (response && response.issues) {
        setIssues(response.issues || []);
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
      toast.error('Failed to fetch issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadIssues(1, newFilters);
  };

  const handlePageChange = (newPage) => {
    loadIssues(newPage, filters);
  };

  if (categoriesLoading) {
    return (
      <div className="issues-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="issues-page">
      <div className="page-header">
        <h1>Civic Issues</h1>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaList /> List
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <FaMapMarkedAlt /> Map
          </button>
        </div>
      </div>

      <IssueFilters 
        onFilterChange={handleFilterChange} 
        categories={categories} 
      />

      {viewMode === 'list' ? (
        <>
          <IssueList issues={issues} loading={loading} />
          
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="map-view">
          <p>Map view coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default Issues;