import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';
import { 
  FaMapMarkedAlt, 
  FaUsers, 
  FaCheckCircle, 
  FaClock
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    totalUsers: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    issuesByStatus: [],
    issuesByCategory: [],
    recentIssues: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      console.log('Admin stats response:', response);
      
      if (response && response.success) {
        const statsData = response.stats || {};
        
        // Extract values safely - handle objects vs primitives
        const totalIssues = statsData.issues?.total || 
                           statsData.totalIssues || 
                           statsData.total_issues || 0;
        
        const totalUsers = statsData.users?.total_users || 
                          statsData.totalUsers || 
                          statsData.total_users || 0;
        
        const pendingCount = statsData.issues?.byStatus?.find(s => s.status === 'pending')?.count ||
                            statsData.pendingIssues || 0;
        
        const resolvedCount = statsData.issues?.byStatus?.find(s => s.status === 'resolved')?.count ||
                             statsData.resolvedIssues || 0;
        
        setStats({
          totalIssues: typeof totalIssues === 'object' ? totalIssues.total || 0 : totalIssues,
          totalUsers: typeof totalUsers === 'object' ? totalUsers.total || 0 : totalUsers,
          pendingIssues: typeof pendingCount === 'object' ? pendingCount.count || 0 : pendingCount,
          resolvedIssues: typeof resolvedCount === 'object' ? resolvedCount.count || 0 : resolvedCount,
          issuesByStatus: statsData.issues?.byStatus || [],
          issuesByCategory: statsData.issues?.byCategory || [],
          recentIssues: statsData.issues?.recent || []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const statusData = {
    labels: stats.issuesByStatus.map(s => s.status ? s.status.replace('_', ' ') : 'Unknown'),
    datasets: [
      {
        label: 'Issues by Status',
        data: stats.issuesByStatus.map(s => {
          const count = s.count;
          return typeof count === 'object' ? (count.total || count.count || 0) : count;
        }),
        backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545'],
        borderWidth: 1
      }
    ]
  };

  const categoryData = {
    labels: stats.issuesByCategory.map(c => c.name || 'Unknown'),
    datasets: [
      {
        label: 'Issues by Category',
        data: stats.issuesByCategory.map(c => {
          const count = c.count;
          return typeof count === 'object' ? (count.total || count.count || 0) : count;
        }),
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <StatsCard
            title="Total Issues"
            value={stats.totalIssues}
            icon={<FaMapMarkedAlt size={24} />}
            color="#007bff"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers size={24} />}
            color="#28a745"
          />
          <StatsCard
            title="Pending Issues"
            value={stats.pendingIssues}
            icon={<FaClock size={24} />}
            color="#ffc107"
          />
          <StatsCard
            title="Resolved Issues"
            value={stats.resolvedIssues}
            icon={<FaCheckCircle size={24} />}
            color="#17a2b8"
          />
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h3>Issues by Status</h3>
            {stats.issuesByStatus.length > 0 ? (
              <Pie data={statusData} options={options} />
            ) : (
              <p>No status data available</p>
            )}
          </div>

          <div className="chart-container">
            <h3>Issues by Category</h3>
            {stats.issuesByCategory.length > 0 ? (
              <Bar data={categoryData} options={options} />
            ) : (
              <p>No category data available</p>
            )}
          </div>
        </div>

        <div className="recent-issues-admin">
          <h3>Recent Issues</h3>
          <div className="recent-issues-list">
            {stats.recentIssues && stats.recentIssues.length > 0 ? (
              stats.recentIssues.map(issue => (
                <Link to={`/issues/${issue.id}`} key={issue.id} className="recent-issue-item">
                  <div className="issue-info">
                    <h4>{issue.title}</h4>
                    <p>
                      Reported by: {issue.reporter_name || issue.user_name} | 
                      Category: {issue.category_name}
                    </p>
                  </div>
                  <span className={`status-badge ${issue.status}`}>
                    {issue.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </Link>
              ))
            ) : (
              <p>No recent issues</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;