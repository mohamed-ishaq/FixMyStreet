import React, { useState, useEffect } from 'react';
import { getUsers, toggleUserStatus } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FaUser, FaEnvelope, FaCalendar, FaBan, FaCheck, FaSync } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      console.log('Users response:', response);
      
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await toggleUserStatus(userId);
      if (response.success) {
        toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Manage Users</h1>
          <button onClick={handleRefresh} className="btn-secondary">
            <FaSync /> Refresh
          </button>
        </div>

        <div className="users-header">
          <input
            type="text"
            placeholder="Search users by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <p>Total Users: {filteredUsers.length}</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <div className="user-info">
                      <h3>{user.full_name}</h3>
                      <p className="user-username">@{user.username}</p>
                    </div>
                  </div>

                  <div className="user-details">
                    <div className="detail-item">
                      <FaEnvelope />
                      <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendar />
                      <span>Joined {format(new Date(user.created_at), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  <div className="user-role">
                    Role: <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Administrator' : 'Community Member'}
                    </span>
                  </div>

                  <div className="user-status">
                    Status: 
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="user-actions">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`status-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {user.is_active ? <FaBan /> : <FaCheck />}
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-users">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;