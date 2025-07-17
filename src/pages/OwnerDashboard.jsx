const API_URL = import.meta.env.VITE_API_URL || 'https://ema-v3-backend.onrender.com/';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './OwnerDaschboard.css';

export default function OwnerDashboard() {
  const [residences, setResidences] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('residences'); // 'residences' ou 'reservations'
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // Filtre pour les réservations
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les résidences du propriétaire
        const resRes = await axios.get(`${API_URL}/api/residences`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ownerResidences = resRes.data.filter(
          (r) => r.owner === user._id
        );
        setResidences(ownerResidences);

        // Récupérer les réservations pour les résidences du propriétaire
        const reservationsRes = await axios.get(`${API_URL}/api/reservations/owner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReservations(reservationsRes.data);

        // Récupérer les statistiques
        const statsRes = await axios.get(`${API_URL}/api/reservations/stats/owner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(statsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'owner') {
      fetchData();
    }
  }, [user, token]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Supprimer cette résidence ?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/residences/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResidences(residences.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleReservationStatus = async (reservationId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/reservations/${reservationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Mettre à jour l'état local
      setReservations(reservations.map(reservation => 
        reservation._id === reservationId 
          ? { ...reservation, status: newStatus }
          : reservation
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmée': return '#28a745';
      case 'annulée': return '#dc3545';
      case 'en attente': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmée': return '✅';
      case 'annulée': return '❌';
      case 'en attente': return '⏳';
      default: return '❓';
    }
  };

  // Filtrer les réservations selon le statut
  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filterStatus);

  if (loading) {
    return <div className="dashboard"><p>Chargement...</p></div>;
  }

  return (
    <div className="dashboard">
      <h2>Tableau de bord Propriétaire</h2>

      {/* Navigation par onglets */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'residences' ? 'active' : ''}`}
          onClick={() => setActiveTab('residences')}
        >
          🏠 Mes Résidences ({residences.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          📅 Réservations ({reservations.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiques
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'residences' && (
        <div className="tab-content">
          <div style={{ marginBottom: '1rem' }}>
            <Link to="/residence/new" className="btn btn-primary">
              ➕ Ajouter une résidence
            </Link>
          </div>

          {residences.length === 0 ? (
            <p>Vous n'avez encore publié aucune résidence.</p>
          ) : (
            <div className="residences-grid">
              {residences.map((res) => (
                <div key={res._id} className="residence-card">
                  <div className="residence-image">
                    {res.media && res.media.length > 0 ? (
                      <img 
                        src={`${API_URL}${res.media[0].url}`} 
                        alt={res.title}
                        className="residence-thumbnail"
                      />
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </div>
                  <div className="residence-info">
                    <h4>{res.title}</h4>
                    <p className="location">📍 {res.location}</p>
                    <p className="price">{(res.prixParNuit || res.price || 0).toLocaleString()} FCFA/nuit</p>
                  </div>
                  <div className="residence-actions">
                    <Link to={`/residence/edit/${res._id}`} className="btn btn-edit">
                      ✏️ Modifier
                    </Link>
                    <button onClick={() => handleDelete(res._id)} className="btn btn-delete">
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="tab-content">
          {/* Filtres pour les réservations */}
          <div className="reservations-filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes les réservations</option>
              <option value="en attente">En attente</option>
              <option value="confirmée">Confirmées</option>
              <option value="annulée">Annulées</option>
            </select>
          </div>

          {filteredReservations.length === 0 ? (
            <p>Aucune réservation {filterStatus !== 'all' ? `avec le statut "${filterStatus}"` : ''} pour le moment.</p>
          ) : (
            <div className="reservations-list">
              {filteredReservations.map((reservation) => (
                <div key={reservation._id} className="reservation-card">
                  <div className="reservation-header">
                    <div className="reservation-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                      >
                        {getStatusIcon(reservation.status)} {reservation.status}
                      </span>
                    </div>
                    <div className="reservation-date">
                      {formatDate(reservation.createdAt)}
                    </div>
                  </div>

                  <div className="reservation-details">
                    <div className="residence-info">
                      <h4>{reservation.residence?.title || 'Résidence supprimée'}</h4>
                      <p>📍 {reservation.residence?.location}</p>
                    </div>

                    <div className="client-info">
                      <h5>👤 Client</h5>
                      <p>{reservation.user?.name || 'Client inconnu'}</p>
                      <p>📧 {reservation.user?.email}</p>
                    </div>

                    <div className="stay-info">
                      <h5>📅 Séjour</h5>
                      <p>Du {formatDate(reservation.startDate)} au {formatDate(reservation.endDate)}</p>
                      <p>Durée: {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24))} nuits</p>
                    </div>

                    <div className="price-info">
                      <h5>💰 Prix</h5>
                      <p className="total-price">{reservation.totalPrice?.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {reservation.status === 'en attente' && (
                    <div className="reservation-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleReservationStatus(reservation._id, 'confirmée')}
                      >
                        ✅ Confirmer
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleReservationStatus(reservation._id, 'annulée')}
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>📊 Réservations Totales</h3>
              <p className="stat-number">{stats.totalReservations || 0}</p>
            </div>
            <div className="stat-card">
              <h3>✅ Confirmées</h3>
              <p className="stat-number">{stats.confirmedReservations || 0}</p>
            </div>
            <div className="stat-card">
              <h3>⏳ En Attente</h3>
              <p className="stat-number">{stats.pendingReservations || 0}</p>
            </div>
            <div className="stat-card">
              <h3>❌ Annulées</h3>
              <p className="stat-number">{stats.cancelledReservations || 0}</p>
            </div>
            <div className="stat-card revenue">
              <h3>💰 Revenus Totaux</h3>
              <p className="stat-number">{(stats.totalRevenue || 0).toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}