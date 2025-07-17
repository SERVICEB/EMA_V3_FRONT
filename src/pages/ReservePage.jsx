// src/pages/ReservationPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, RefreshCw } from 'lucide-react';
import { fetchResidences } from '../api/api';
import './ReservationPage.css';

// Configuration unique de l'API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://ema-v3-backend.onrender.com/';
const isProduction = window.location.hostname !== 'localhost';

// Fonction pour obtenir l'URL complète d'un média
const getMediaUrl = (path) => {
  if (!path) return '';

  // Ajouter un slash si nécessaire
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Logs de débogage
  console.log('Media URL:', `${API_URL}${normalizedPath}`);
  console.log('Media path:', {
    original: path,
    normalized: normalizedPath,
    windowOrigin: window.location.origin,
    apiUrl: API_URL
  });

  return `${API_URL}${normalizedPath}`;
};

const getMediaType = (url) => {
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  return 'image';
};

const ReservationPage = () => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadResidences = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      
      console.log('=== Load Residences Start ===');
      const data = await fetchResidences();
      
      console.log('=== Load Residences Success ===');
      console.log('Number of residences:', data?.length);
      
      setResidences(data);
    } catch (err) {
      console.error('=== Load Residences Error ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Ajout de messages d'erreur plus détaillés
      let errorMessage = 'Erreur de chargement des résidences';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Non authentifié. Veuillez vous connecter.';
        } else if (err.response.status === 403) {
          errorMessage = 'Accès refusé. Vérifiez vos permissions.';
        } else if (err.response.status === 404) {
          errorMessage = 'Ressource non trouvée. L\'API peut être indisponible.';
        } else if (err.response.status === 500) {
          errorMessage = 'Erreur serveur. Vérifiez les logs du backend.';
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'La requête a expiré. Vérifiez votre connexion internet.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResidences();
    const interval = setInterval(() => loadResidences(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => loadResidences(true);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadResidences} className="retry-button">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Résidences Disponibles</h1>
            <p className="page-subtitle">
              Découvrez nos hébergements ({residences.length} résidence{residences.length > 1 ? 's' : ''})
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="refresh-button" title="Actualiser">
            <RefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          </button>
        </div>

        <div className="residences-grid">
          {residences.map((residence) => {
            const cover = residence.media?.[0];
            const mediaUrl = getMediaUrl(cover?.url);
            // Utilise le type du modèle ou détermine le type depuis l'URL
            const mediaType = cover?.type || getMediaType(mediaUrl);

            return (
              <div key={residence._id} className="residence-card">
                <div className="residence-image">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt={residence.title}
                      onError={(e) => {
                        console.error('Erreur chargement image:', e);
                        console.error('Media info:', {
                          url: mediaUrl,
                          type: mediaType,
                          residenceId: residence._id
                        });
                        e.target.style.display = 'none';
                        const fallback = e.target.parentNode.querySelector('.fallback-icon');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : mediaType === 'video' ? (
                    <video src={mediaUrl} controls className="video-preview" />
                  ) : (
                    // Fallback pour les types non reconnus
                    <div className="fallback-icon" style={{ display: 'flex' }}>
                      <span>📷</span>
                    </div>
                  )}

                  {/* Fallback icon (caché par défaut) */}
                  <div className="fallback-icon" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
                    <span>🏠</span>
                  </div>

                  <div className="image-badges">
                    <span className="badge badge-primary">{residence.type}</span>
                    {residence.media?.length > 1 && (
                      <span className="badge badge-secondary">
                        +{residence.media.length - 1} média{residence.media.length > 2 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <h3 className="residence-title">{residence.title}</h3>
                    <div className="location-info">
                      <MapPin className="location-icon" />
                      <span>{residence.location}</span>
                    </div>
                    <div className="date-added">
                      Ajouté le {new Date(residence.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {residence.media?.length > 0 && (
                    <div className="media-info">
                      <Users className="media-icon" />
                      <span>
                        {residence.media.length} média{residence.media.length > 1 ? 's' : ''} (
                        {residence.media.filter(m => (m.type || getMediaType(m.url)) === 'image').length} image
                        {residence.media.filter(m => (m.type || getMediaType(m.url)) === 'image').length > 1 ? 's' : ''},
                        {residence.media.filter(m => (m.type || getMediaType(m.url)) === 'video').length} vidéo
                        {residence.media.filter(m => (m.type || getMediaType(m.url)) === 'video').length > 1 ? 's' : ''}
                        )
                      </span>
                    </div>
                  )}

                  <div className="owner-info">
                    <strong>Propriétaire :</strong> {residence.owner?.name || 'Non spécifié'}
                  </div>

                  {residence.address && (
                    <div className="address-info">
                      <strong>Adresse :</strong> {residence.address}
                    </div>
                  )}

                  {residence.description && (
                    <div className="description-info">
                      <strong>Description :</strong> {residence.description.substring(0, 150)}
                      {residence.description.length > 150 && '...'}
                    </div>
                  )}

                  {residence.amenities?.length > 0 && (
                    <div className="amenities-info">
                      <strong>Équipements :</strong> {residence.amenities.slice(0, 3).join(', ')}
                      {residence.amenities.length > 3 && ` (+${residence.amenities.length - 3} autres)`}
                    </div>
                  )}

                  <div className="price-section">
                    <span className="price-label">Prix :</span>
                    <span className="price-amount">
                      {residence.price?.toLocaleString() || '0'} FCFA
                    </span>
                    <span className="price-unit">/ nuit</span>
                  </div>

                  <button
                    onClick={() => navigate(`/residence/${residence._id}`)}
                    className="reserve-button"
                  >
                    <Calendar className="calendar-icon" />
                    Réserver maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {residences.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏨</div>
            <h3 className="empty-title">Aucune résidence disponible</h3>
            <p className="empty-description">Veuillez réessayer plus tard ou modifier vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;