// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidenceDetails from './components/ResidenceDetails';
import PrivateRoute from './components/PrivateRoute';
import ReservationPage from './pages/ReservationPage';
import ReservePage from './pages/ReservePage';
import NewAnnoncePage from './pages/NewAnnoncePage';
import AnnonceListPage from './pages/AnnonceListPage';
import ReservationsRecues from './pages/ReservationsRecues';


import ClientDashboard from './pages/ClientDashboard'; // À créer
import OwnerDashboard from './pages/OwnerDashboard';   // À créer
//import AdminDashboard from './pages/AdminDashboard';   // À créer

import './App.css';
import ResidenceForm from './components/ResidenceForm';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          {/* Routes publiques */}
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/reserve" element={<ReservePage />} />
          <Route path="/annonce/new" element={<NewAnnoncePage />} />
          <Route path="/annonces" element={<Navigate to="/reserve" />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/proprietaire/reservations" element={<ReservationsRecues />} />



          {/* Routes protégées avec contrôle par rôle */}
          <Route
            path="/client/dashboard"
            element={
              <PrivateRoute allowedRoles={['client']}>
                <ClientDashboard />
              </PrivateRoute>
            }
          />

          

          <Route
            path="/owner/dashboard"
            element={
              <PrivateRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </PrivateRoute>
            }
          />


<Route
  path="/residence/new"
  element={
    <PrivateRoute allowedRoles={['owner']}>
      <ResidenceForm />
    </PrivateRoute>
  }
/>


          {/* Route d'accueil générale (accessible à tous les connectés) */}
          <Route path="/" element={<Home />} />

          <Route
            path="/residence/:id"
            element={
              <PrivateRoute>
                <ResidenceDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
