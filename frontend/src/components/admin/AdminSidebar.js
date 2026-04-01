import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaChartBar, 
  FaList, 
  FaUsers, 
  FaCog,
  FaMapMarkedAlt 
} from 'react-icons/fa';

const AdminSidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/admin', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/admin/issues', icon: <FaList />, label: 'Manage Issues' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Manage Users' },
    { path: '/admin/categories', icon: <FaMapMarkedAlt />, label: 'Categories' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
        {user?.full_name && <p className="admin-user-name">{user.full_name}</p>}
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
