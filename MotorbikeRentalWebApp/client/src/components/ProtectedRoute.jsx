import React from 'react'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !allowedRoles.includes(user.role?.name)) {
        return <Navigate to="/not-allowed" replace />;
    }

    return children;
};

export default ProtectedRoute;
