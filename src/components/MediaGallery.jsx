import React, { useEffect } from 'react';
import './MediaGallery.css';

export default function MediaGallery({ media, onClose }) {
  // Empêche le scroll de la page quand la galerie est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="media-gallery-overlay" onClick={onClose}>
      <div className="media-gallery-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>

        {media.map((item, i) => (
          <div key={i} className="media-item">
            {item.type === 'image' ? (
              <img src={`http://localhost:5000${item.url}`} alt={`media-${i}`} />
            ) : (
              <video controls src={`http://localhost:5000${item.url}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
