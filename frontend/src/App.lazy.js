// src/App.lazy.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './components/common/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Issues = lazy(() => import('./pages/user/Issues'));
const IssueDetails = lazy(() => import('./pages/user/IssueDetails'));
const CreateIssue = lazy(() => import('./pages/user/CreateIssue'));
const Profile = lazy(() => import('./pages/user/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageIssues = lazy(() => import('./pages/admin/ManageIssues'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const AppLazy = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Define routes here with lazy loaded components */}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppLazy;