// src/pages/AnnonceListPage.jsx
import React, { useEffect, useState } from 'react';
import { fetchAnnonces as fetchAnnoncesAPI } from '../api/api';
import './AnnonceListPage.css';

const AnnonceListPage = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnonces = async () => {
      try {
        const data = await fetchAnnoncesAPI();
        setAnnonces(data);
      } catch (err) {
        console.error('Erreur chargement des annonces :', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnnonces();
  }, []);

  return (
    <div className="annonce-list-page">
      <h1>Toutes les annonces</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : annonces.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <div className="annonce-grid">
          {annonces.map((a, i) => (
            <div key={i} className="annonce-card">
              <img src={a.images?.[0]} alt="preview" />
              <h3>{a.typeBien} - {a.ville}</h3>
              <p>{a.prix} FCFA</p>
              <p>{a.quartier}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnonceListPage;
