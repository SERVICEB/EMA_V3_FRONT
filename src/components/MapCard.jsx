/* --------- File: src/components/MapCard.jsx --------- */
import React from 'react';
import './MapCard.css';

export default function MapCard() {
  return (
    <div className="map-card">
      <iframe
        title="Carte Abidjan"
        width="400"
        height="380"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps?q=Abidjan&output=embed"
      ></iframe>
      <div className="marker"></div>
    </div>
  );
}

