// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ CORRECTION

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role || 'user';

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    return <Navigate to="/connexion" replace />;
  }
}
