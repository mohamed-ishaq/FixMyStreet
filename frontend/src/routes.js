import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Issues from './pages/user/Issues';
import IssueDetails from './pages/user/IssueDetails';
import CreateIssue from './pages/user/CreateIssue';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageIssues from './pages/admin/ManageIssues';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';
import Settings from './pages/admin/Settings';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Loading from './components/common/Loading';
import { useAuth } from './context/AuthContext';

// Route constants for easy maintenance
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // User routes
  DASHBOARD: '/dashboard',
  ISSUES: '/issues',
  ISSUE_DETAILS: '/issues/:id',
  CREATE_ISSUE: '/create-issue',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ISSUES: '/admin/issues',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Default
  HOME: '/',
  NOT_FOUND: '*'
};

// Route configurations with metadata
export const routeConfig = {
  // Public routes
  [ROUTES.LOGIN]: {
    component: Login,
    title: 'Login',
    requiresAuth: false,
    layout: 'auth'
  },
  [ROUTES.REGISTER]: {
    component: Register,
    title: 'Register',
    requiresAuth: false,
    layout: 'auth'
  },
  
  // User routes
  [ROUTES.DASHBOARD]: {
    component: Dashboard,
    title: 'Dashboard',
    requiresAuth: true,
    role: 'user',
    layout: 'main',
    showInNav: true,
    icon: 'FaChartBar'
  },
  [ROUTES.ISSUES]: {
    component: Issues,
    title: 'All Issues',
    requiresAuth: true,
    role: 'user',
    layout: 'main',
    showInNav: true,
    icon: 'FaList'
  },
  [ROUTES.ISSUE_DETAILS]: {
    component: IssueDetails,
    title: 'Issue Details',
    requiresAuth: true,
    role: 'user',
    layout: 'main',
    showInNav: false
  },
  [ROUTES.CREATE_ISSUE]: {
    component: CreateIssue,
    title: 'Report Issue',
    requiresAuth: true,
    role: 'user',
    layout: 'main',
    showInNav: true,
    icon: 'FaPlus'
  },
  [ROUTES.PROFILE]: {
    component: Profile,
    title: 'My Profile',
    requiresAuth: true,
    role: 'user',
    layout: 'main',
    showInNav: true,
    icon: 'FaUser'
  },
  
  // Admin routes
  [ROUTES.ADMIN_DASHBOARD]: {
    component: AdminDashboard,
    title: 'Admin Dashboard',
    requiresAuth: true,
    role: 'admin',
    layout: 'admin',
    showInNav: true,
    icon: 'FaChartBar'
  },
  [ROUTES.ADMIN_ISSUES]: {
    component: ManageIssues,
    title: 'Manage Issues',
    requiresAuth: true,
    role: 'admin',
    layout: 'admin',
    showInNav: true,
    icon: 'FaList'
  },
  [ROUTES.ADMIN_USERS]: {
    component: ManageUsers,
    title: 'Manage Users',
    requiresAuth: true,
    role: 'admin',
    layout: 'admin',
    showInNav: true,
    icon: 'FaUsers'
  },
  [ROUTES.ADMIN_CATEGORIES]: {
    component: ManageCategories,
    title: 'Manage Categories',
    requiresAuth: true,
    role: 'admin',
    layout: 'admin',
    showInNav: true,
    icon: 'FaMapMarkedAlt'
  },
  [ROUTES.ADMIN_SETTINGS]: {
    component: Settings,
    title: 'Settings',
    requiresAuth: true,
    role: 'admin',
    layout: 'admin',
    showInNav: true,
    icon: 'FaCog'
  }
};

// Helper function to get routes by role
export const getRoutesByRole = (role) => {
  return Object.entries(routeConfig)
    .filter(([_, config]) => {
      if (role === 'admin') return true;
      if (role === 'user') return config.role !== 'admin';
      return !config.requiresAuth;
    })
    .map(([path, config]) => ({ path, ...config }));
};

// Helper function to get navigation items
export const getNavItems = (role) => {
  return Object.entries(routeConfig)
    .filter(([_, config]) => config.showInNav && 
      (role === 'admin' ? true : config.role !== 'admin'))
    .map(([path, config]) => ({
      path,
      label: config.title,
      icon: config.icon
    }));
};

// Main Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      
      {/* User Routes */}
      <Route path={ROUTES.DASHBOARD} element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ISSUES} element={
        <PrivateRoute>
          <Issues />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ISSUE_DETAILS} element={
        <PrivateRoute>
          <IssueDetails />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.CREATE_ISSUE} element={
        <PrivateRoute>
          <CreateIssue />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.PROFILE} element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      
      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN_DASHBOARD} element={
        <PrivateRoute adminOnly>
          <AdminDashboard />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ADMIN_ISSUES} element={
        <PrivateRoute adminOnly>
          <ManageIssues />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ADMIN_USERS} element={
        <PrivateRoute adminOnly>
          <ManageUsers />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ADMIN_CATEGORIES} element={
        <PrivateRoute adminOnly>
          <ManageCategories />
        </PrivateRoute>
      } />
      
      <Route path={ROUTES.ADMIN_SETTINGS} element={
        <PrivateRoute adminOnly>
          <Settings />
        </PrivateRoute>
      } />
      
      {/* Default Routes */}
      <Route path={ROUTES.HOME} element={<HomeRedirect />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
};

const HomeRedirect = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <Loading message="Loading..." />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} replace />;
};

// Not Found Component
const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => window.history.back()}
        className="back-button"
      >
        Go Back
      </button>
    </div>
  );
};

// Route Guard Component
export const RouteGuard = ({ children, requiredRole }) => {
  // This will be used with the PrivateRoute component
  return children;
};

// Breadcrumb generator
export const generateBreadcrumbs = (pathname) => {
  const paths = pathname.split('/').filter(p => p);
  const breadcrumbs = [];
  
  let currentPath = '';
  paths.forEach(path => {
    currentPath += `/${path}`;
    const route = Object.entries(routeConfig).find(([routePath]) => 
      routePath === currentPath || 
      (routePath.includes(':') && currentPath.match(new RegExp(routePath.replace(/:[^/]+/g, '[^/]+'))))
    );
    
    if (route) {
      breadcrumbs.push({
        path: currentPath,
        label: route[1].title,
        isLast: currentPath === pathname
      });
    }
  });
  
  return breadcrumbs;
};

// Lazy loading wrapper for code splitting
export const lazyLoad = (importFunc, fallback = <Loading />) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Lazy loaded routes for better performance
export const lazyRoutes = {
  // Auth
  Login: lazyLoad(() => import('./pages/auth/Login')),
  Register: lazyLoad(() => import('./pages/auth/Register')),
  
  // User
  Dashboard: lazyLoad(() => import('./pages/user/Dashboard')),
  Issues: lazyLoad(() => import('./pages/user/Issues')),
  IssueDetails: lazyLoad(() => import('./pages/user/IssueDetails')),
  CreateIssue: lazyLoad(() => import('./pages/user/CreateIssue')),
  Profile: lazyLoad(() => import('./pages/user/Profile')),
  
  // Admin
  AdminDashboard: lazyLoad(() => import('./pages/admin/AdminDashboard')),
  ManageIssues: lazyLoad(() => import('./pages/admin/ManageIssues')),
  ManageUsers: lazyLoad(() => import('./pages/admin/ManageUsers')),
  ManageCategories: lazyLoad(() => import('./pages/admin/ManageCategories')),
  Settings: lazyLoad(() => import('./pages/admin/Settings'))
};

export default AppRoutes;
