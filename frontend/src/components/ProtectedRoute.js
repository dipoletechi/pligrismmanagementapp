import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const { isAuthenticated, user, hasAnyRole, hasPermission, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger text-center">
              <h4>Access Denied</h4>
              <p>You don't have permission to access this page.</p>
              <p>Required roles: {requiredRoles.join(', ')}</p>
              <p>Your role: {user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(({ module, action }) =>
      hasPermission(module, action)
    );

    if (!hasAllPermissions) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <h4>Access Denied</h4>
                <p>You don't have the required permissions to access this page.</p>
                <p>Required permissions: {requiredPermissions.map(p => `${p.action} ${p.module}`).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
