// src/components/ActionSidebar.jsx
import React from 'react';
import { FiCalendar, FiPlus, FiList } from 'react-icons/fi'; // ⬅️ Ajout de FiList
import { Link } from 'react-router-dom';
import './ActionSidebar.css';

export default function ActionSidebar() {
  return (
    <div className="action-sidebar">
      {/* Bouton Voir les annonces uniquement */}
      <Link to="/annonces" className="action-card">
        <FiList size={24} />
        <p className="action-title">
          Voir<br />les annonces
        </p>
      </Link>
    </div>
  );
}
