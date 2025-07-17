import React, { useEffect, useState } from 'react';
import SearchForm from '../components/SearchForm';
import ResidenceList from '../components/ResidenceList';
import MapCard from '../components/MapCard';
import ActionSidebar from '../components/ActionSidebar';
import { fetchResidences } from '../api/api'; // ✅ On utilise le helper
import './Home.css';


export default function Home() {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = { role: 'owner' }; // À remplacer plus tard avec l'auth réelle

  useEffect(() => {
    const loadResidences = async () => {
      try {
        console.log('=== Home Page - Load Residences Start ===');
        console.log('Environment:', window.location.hostname);
        console.log('Token in localStorage:', !!localStorage.getItem('token'));
        
        const data = await fetchResidences();
        
        console.log('=== Home Page - Load Residences Success ===');
        console.log('Number of residences:', data?.length);
        console.log('First residence:', data?.[0]);
        
        setResidences(data);
      } catch (err) {
        console.error('=== Home Page - Load Residences Error ===');
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
      }
    };

    loadResidences();
  }, []);

  return (
    <main
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        minHeight: '100vh'
      }}
    >
      {/* Overlay pour améliorer la lisibilité */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
      />

      {/* Contenu par-dessus l'overlay */}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <section className="hero">
          <h1 className="hero-title">
            Trouvez des résidences<br />meublées à Abidjan
          </h1>
          <SearchForm />
        </section>

        <div className="content-grid">
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <ResidenceList residences={residences} user={user} />
          )}

          <aside className="sidebar">
            <MapCard />
            <ActionSidebar />
          </aside>
        </div>
      </div>
    </main>
  );
}