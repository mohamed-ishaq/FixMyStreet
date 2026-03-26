import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const IssueFilters = ({ onFilterChange, categories }) => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const newFilters = {
      status: '',
      category: '',
      search: '',
      sortBy: 'newest'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search issues..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <FaSearch />
          </button>
        </div>
        
        <button 
          type="button" 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filters
        </button>
      </form>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleChange}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_commented">Most Commented</option>
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={applyFilters} className="apply-filters-btn">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueFilters;