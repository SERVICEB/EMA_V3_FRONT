// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  // Récupérer l'utilisateur depuis localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr);

  // Vérifier le rôle
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
