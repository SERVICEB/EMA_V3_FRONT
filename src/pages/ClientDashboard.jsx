const API_URL = import.meta.env.VITE_API_URL || 'https://ema-v3-backend.onrender.com/';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './ClientDashboard.css';

export default function ClientDashboard() {
  const [residences, setResidences] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResidences, setShowResidences] = useState(false);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = token ? jwtDecode(token).id : user?._id;

  const fetchReservations = async () => {
    if (!token || !user) {
      setReservationsLoading(false);
      return;
    }

    try {
      setReservationsLoading(true);
      const { data } = await api.get('/reservations/client');
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur client:', error);
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  const fetchResidences = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/residences`);
      const data = res.data.data || res.data;
      setResidences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement résidences:', err);
      setResidences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    if (showResidences) {
      fetchResidences();
    }
  }, [showResidences]);

  const handleCancelReservation = async (reservationId) => {
    const confirm = window.confirm('Annuler cette réservation ?');
    if (!confirm) return;

    try {
      await axios.patch(
        `${API_URL}/api/reservations/${reservationId}/status`,
        { status: 'annulée' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(prev =>
        prev.map(r => r._id === reservationId ? { ...r, status: 'annulée' } : r)
      );
      alert('Réservation annulée');
    } catch (error) {
      console.error(error);
      alert('Erreur annulation');
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const confirm = window.confirm('Supprimer définitivement ?');
    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(prev => prev.filter(r => r._id !== reservationId));
      alert('Supprimée avec succès');
    } catch (error) {
      console.error(error);
      alert('Erreur suppression');
    }
  };

  const getImageUrl = useCallback((residence) => {
    const firstImage = residence?.media?.find(m => m.type === 'image');
    if (firstImage?.url) {
      let url = firstImage.url.replace(/^\/+/, '').replace(/\\/g, '/');
      if (!url.startsWith('uploads/')) url = `uploads/${url}`;
      return `${API_URL}/${url}`;
    }
    return 'https://via.placeholder.com/300x200/cccccc/ffffff?text=Pas+d%27image';
  }, []);

  const getStatusDisplay = (status) => {
    const map = {
      'en attente': { text: 'En attente', icon: '⏳', class: 'pending', color: '#ffc107' },
      'confirmée': { text: 'Confirmée', icon: '✅', class: 'confirmed', color: '#28a745' },
      'confirmee': { text: 'Confirmée', icon: '✅', class: 'confirmed', color: '#28a745' },
      'annulée': { text: 'Annulée', icon: '❌', class: 'cancelled', color: '#dc3545' },
      'annulee': { text: 'Annulée', icon: '❌', class: 'cancelled', color: '#dc3545' },
      'terminée': { text: 'Terminée', icon: '🏁', class: 'completed', color: '#6c757d' },
      'terminee': { text: 'Terminée', icon: '🏁', class: 'completed', color: '#6c757d' },
    };
    return map[status?.toLowerCase()] || { text: status || 'Inconnu', icon: '❓', class: 'unknown', color: '#6c757d' };
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR');
  const isReservationPast = (endDate) => new Date(endDate) < new Date();
  const isReservationActive = (start, end) => {
    const now = new Date();
    return new Date(start) <= now && new Date(end) > now;
  };

  const filteredReservations = filterStatus === 'all'
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'en attente').length,
    confirmed: reservations.filter(r => ['confirmée', 'confirmee'].includes(r.status)).length,
    cancelled: reservations.filter(r => ['annulée', 'annulee'].includes(r.status)).length,
    completed: reservations.filter(r => ['terminée', 'terminee'].includes(r.status)).length,
  };

  if (!token || !user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>🔒 Accès restreint</h2>
          <p>Connectez-vous pour voir vos réservations.</p>
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👋 Bienvenue {user?.name || 'Client'} !</h1>
        <p>Gérez vos réservations et découvrez des résidences</p>
        <div className="header-actions">
          <Link to="/client/dashboard" className="btn btn-primary">🏠 Parcourir les résidences</Link>
          <button onClick={() => setShowResidences(!showResidences)} className="btn btn-secondary">
            {showResidences ? 'Masquer' : 'Afficher'} les résidences
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-content"><h3>{stats.total}</h3><p>Réservations totales</p></div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-content"><h3>{stats.confirmed}</h3><p>Confirmées</p></div></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-content"><h3>{stats.pending}</h3><p>En attente</p></div></div>
        <div className="stat-card"><div className="stat-icon">❌</div><div className="stat-content"><h3>{stats.cancelled}</h3><p>Annulées</p></div></div>
      </div>

      {/* Réservations */}
      <div className="reservations-section">
        <div className="section-header">
          <h2>📆 Vos réservations</h2>
          {reservations.length > 0 && <span className="count-badge">{reservations.length}</span>}
        </div>

        <div className="reservations-filters">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">Toutes ({stats.total})</option>
            <option value="en attente">En attente ({stats.pending})</option>
            <option value="confirmée">Confirmées ({stats.confirmed})</option>
            <option value="annulée">Annulées ({stats.cancelled})</option>
          </select>
        </div>

        {reservationsLoading ? (
          <div className="loading"><div className="spinner"></div><p>Chargement...</p></div>
        ) : filteredReservations.length === 0 ? (
          <div className="no-reservations"><p>Aucune réservation {filterStatus !== 'all' && `avec le statut "${filterStatus}"`}.</p></div>
        ) : (
          <div className="reservations-list">
            {filteredReservations.map(reservation => {
              const statusInfo = getStatusDisplay(reservation.status);
              const res = reservation.residence || reservation.residenceId;
              return (
                <div key={reservation._id} className="reservation-card">
                  <div className="reservation-header">
                    <div className="reservation-title">
                      <h4>🛏️ {res?.title || 'Résidence inconnue'}</h4>
                      <span className={`status-badge status-${statusInfo.class}`} style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>
                    <div className="reservation-date">Réservé le {formatDate(reservation.createdAt)}</div>
                  </div>

                  <div className="reservation-content">
                    <div className="residence-info">
                      <div className="residence-image">
                        <img src={getImageUrl(res)} alt={res?.title} className="residence-thumbnail" onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/e74c3c/ffffff?text=🏠';
                        }} />
                      </div>
                      <div className="residence-details">
                        <p>📍 {res?.location || 'Localisation inconnue'}</p>
                        <p>💰 {(res?.prixParNuit || res?.price || 0).toLocaleString()} FCFA/nuit</p>
                      </div>
                    </div>

                    <div className="stay-info">
                      <div><strong>Arrivée:</strong> {formatDate(reservation.startDate)}</div>
                      <div><strong>Départ:</strong> {formatDate(reservation.endDate)}</div>
                      <div><strong>Durée:</strong> {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24))} nuit(s)</div>
                      <div><strong>Invités:</strong> {reservation.guestCount || 1}</div>
                      {reservation.status === 'confirmée' && (
                        isReservationActive(reservation.startDate, reservation.endDate)
                          ? <div className="active-stay">🔥 Séjour en cours</div>
                          : isReservationPast(reservation.endDate)
                          ? <div className="past-stay">✅ Séjour terminé</div>
                          : <div className="future-stay">🗓️ À venir</div>
                      )}
                    </div>

                    <div className="price-info"><strong>Total: {(reservation.totalPrice || 0).toLocaleString()} FCFA</strong></div>

                    {reservation.notes && <div className="notes-info"><h5>📝 Notes</h5><p>{reservation.notes}</p></div>}
                  </div>

                  <div className="reservation-actions">
                    {reservation.status === 'en attente' && (
                      <button onClick={() => handleCancelReservation(reservation._id)} className="btn btn-danger">❌ Annuler</button>
                    )}
                    {reservation.status === 'annulée' && (
                      <button onClick={() => handleDeleteReservation(reservation._id)} className="btn btn-delete">🗑️ Supprimer</button>
                    )}
                    <div className="action-buttons">
                      <Link to={`/reservation/${reservation._id}`} className="btn btn-outline">👁️ Détails</Link>
                      {res?._id && (
                        <Link to={`/residence/${res._id}`} className="btn btn-outline">🏠 Voir la résidence</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Résidences disponibles */}
      {showResidences && (
        <div className="residences-section">
          <div className="section-header">
            <h2>🏡 Résidences disponibles</h2>
            {residences.length > 0 && <span className="count-badge">{residences.length}</span>}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div><p>Chargement...</p></div>
          ) : (
            <div className="residences-grid">
              {residences.length > 0 ? (
                residences.slice(0, 6).map(res => (
                  <div key={res._id} className="residence-card">
                    <img src={getImageUrl(res)} alt={res.title} className="residence-image" />
                    <div className="residence-info">
                      <h3>{res.title}</h3>
                      <p>📍 {res.location}</p>
                      <p>💰 {(res.prixParNuit || res.price || 0).toLocaleString()} FCFA/nuit</p>
                      <Link to={`/residence/${res._id}`} className="details-btn">Voir les détails</Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucune résidence disponible pour le moment.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
