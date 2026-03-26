// src/utils/routeHelpers.js
import { ROUTES, routeConfig } from '../routes';

// Check if route is accessible by user
export const isRouteAccessible = (path, userRole) => {
  const route = Object.entries(routeConfig).find(([routePath]) => {
    // Handle dynamic routes
    if (routePath.includes(':')) {
      const routeRegex = new RegExp('^' + routePath.replace(/:[^/]+/g, '[^/]+') + '$');
      return routeRegex.test(path);
    }
    return routePath === path;
  });

  if (!route) return false;
  
  const [, config] = route;
  
  if (!config.requiresAuth) return true;
  if (userRole === 'admin') return true;
  if (config.role === 'admin' && userRole !== 'admin') return false;
  
  return true;
};

// Get default route for user role
export const getDefaultRoute = (role) => {
  return role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;
};

// Generate dynamic route path
export const generatePath = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

// Get route title
export const getRouteTitle = (path) => {
  const route = Object.entries(routeConfig).find(([routePath]) => {
    if (routePath.includes(':')) {
      const routeRegex = new RegExp('^' + routePath.replace(/:[^/]+/g, '[^/]+') + '$');
      return routeRegex.test(path);
    }
    return routePath === path;
  });
  
  return route ? route[1].title : 'Not Found';
};