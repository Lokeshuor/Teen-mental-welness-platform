import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles }) => {
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getRole();
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
            case 'student':
                return <Navigate to="/student/dashboard" replace />;
            case 'therapist':
                return <Navigate to="/therapist/dashboard" replace />;
            case 'parent':
                return <Navigate to="/parent/dashboard" replace />;
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;