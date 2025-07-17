import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaGallery from './MediaGallery';
import './ResidenceCard.css';

// Configuration de l'API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';

export default function ResidenceCard({ residence, onEdit, onDelete, user }) {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);

  // Logs de débogage
  console.log('=== ResidenceCard Debug ===');
  console.log('Residence ID:', residence._id);
  console.log('Media count:', residence.media?.length);
  const firstMedia = residence.media?.[0];
  console.log('First media:', firstMedia);
  console.log('API URL:', import.meta.env.VITE_API_URL);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Fonction pour obtenir l'URL complète d'un média
  const getMediaUrl = (media) => {
    if (!media?.url) return null;
    
    // Utiliser l'API URL configuré
    const baseUrl = API_URL;
    
    // Ajouter un slash si nécessaire
    const normalizedUrl = media.url.startsWith('/') ? media.url : `/${media.url}`;
    
    console.log('Media URL:', `${baseUrl}${normalizedUrl}`);
    console.log('Media info:', {
      originalUrl: media.url,
      normalizedUrl,
      windowOrigin: window.location.origin,
      baseUrl
    });
    
    return `${baseUrl}${normalizedUrl}`;
  };

  // Fonction pour gérer le clic sur l'image
  const handleImageClick = () => {
    navigate(`/residence/${residence._id}`);
  };

  // Fonction pour gérer le clic sur la galerie (empêche la redirection)
  const handleGalleryClick = (e) => {
    e.stopPropagation(); // Empêche la propagation du clic
    setShowGallery(true);
  };

  return (
    <div className="residence-card">
      <div className="card-image-wrapper" onClick={handleImageClick}>
        {firstMedia ? (
          firstMedia.type === 'image' ? (
            <img
              className="card-image"
              src={getMediaUrl(firstMedia)}
              alt={residence.title}
              onError={(e) => {
                console.error('Erreur chargement image:', e);
                console.error('Media:', firstMedia);
              }}
            />
          ) : (
            <video
              className="card-image"
              src={getMediaUrl(firstMedia)}
              poster={firstMedia.thumbnail ? getMediaUrl(firstMedia.thumbnail) : undefined}
              // Removed controls to prevent interference with click
            />
          )
        ) : (
          <div className="card-placeholder">Aucun média</div>
        )}

        {/* Bouton pour ouvrir la galerie (optionnel) */}
        {residence.media?.length > 1 && (
          <button 
            className="gallery-btn"
            onClick={handleGalleryClick}
            title="Voir toutes les photos"
          >
            📷 {residence.media.length}
          </button>
        )}

        {user?.role === 'owner' && (
          <div className="card-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Empêche la redirection
                onEdit();
              }} 
              className="btn btn-edit" 
              title="Modifier"
            >
              ✏️
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Empêche la redirection
                onDelete();
              }} 
              className="btn btn-delete" 
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 onClick={handleImageClick} className="clickable-title">{residence.title}</h3>
        <p className="price">{formatPrice(residence.price)}</p>
        <p className="location">📍 {residence.location}</p>
        <button
          onClick={() => navigate(`/residence/${residence._id}`)}
          className="btn btn-detail"
        >
          Voir les disponibilités
        </button>
      </div>

      {/* 🔍 Galerie d'images/vidéos */}
      {showGallery && (
        <MediaGallery
          media={residence.media || []}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}