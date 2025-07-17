import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ResidenceDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';
axios.defaults.baseURL = API_URL;

const ResidenceDetails = () => {
  const { id } = useParams(); // 🔁 identifiant de la résidence depuis l’URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).id : null; // ✅ récupération de l'utilisateur connecté

  const [residence, setResidence] = useState(null);
  const [reservation, setReservation] = useState({ startDate: '', endDate: '' });
  const [nbJours, setNbJours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔄 Charger les détails de la résidence
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/residences/${id}`);
        setResidence(data);
      } catch (err) {
        console.error('Erreur chargement résidence:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // 🧮 Calcul automatique du prix total et du nombre de nuits
  useEffect(() => {
    const { startDate, endDate } = reservation;
    if (startDate && endDate && residence) {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      if (d2 > d1) {
        const diff = Math.ceil((d2 - d1) / (1000 * 3600 * 24));
        const priceNight = residence.price || 0;
        setNbJours(diff);
        setTotalPrice(diff * priceNight);
      } else {
        setNbJours(0);
        setTotalPrice(0);
      }
    } else {
      setNbJours(0);
      setTotalPrice(0);
    }
  }, [reservation, residence]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation(prev => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  // 🎯 Fonction de réservation principale
  const handleReserve = async () => {
    if (!userId) {
      setMessage('❌ Veuillez vous connecter pour effectuer une réservation.');
      setTimeout(() => navigate('/connexion'), 2000);
      return;
    }

    const { startDate, endDate } = reservation;
    if (!startDate || !endDate) return setMessage('⚠️ Veuillez choisir les deux dates.');

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d2 <= d1) return setMessage('⚠️ La date de fin doit être après la date de début.');
    if (d1 < today) return setMessage('⚠️ La date de début ne peut pas être dans le passé.');

    const diff = Math.ceil((d2 - d1) / (1000 * 3600 * 24));
    const priceNight = residence.price || 0;
    const calcTotal = diff * priceNight;

    // ✅ CORRECTION IMPORTANTE : envoyer bien "residenceId" attendu par le backend
    const reservationData = {
      residenceId: residence._id, // ✅ clé correcte (et fiable) attendue par le backend
      startDate,
      endDate,
      totalPrice: calcTotal,
      guestCount: 1,
      notes: ""
    };

    console.log('🔍 === DONNÉES FRONTEND ===');
    console.log('📋 Données envoyées:', JSON.stringify(reservationData, null, 2));

    setIsSubmitting(true);
    setMessage('⏳ Enregistrement en cours…');

    try {
      const response = await axios.post(`${API_URL}/api/reservations`, reservationData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Réservation créée:', response.data);

      setMessage('✅ Réservation enregistrée avec succès !');
      setReservation({ startDate: '', endDate: '' });
      setNbJours(0);
      setTotalPrice(0);

      setTimeout(() => navigate('/client/dashboard'), 2000);
    } catch (err) {
      console.error('❌ === ERREUR DÉTAILLÉE ===');
      console.error('Message:', err.message);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('Data stringified:', JSON.stringify(err.response?.data, null, 2));
      console.error('Headers:', err.response?.headers);

      const status = err.response?.status;
      if (status === 401) {
        setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => navigate('/connexion'), 2000);
      } else if (status === 400 || status === 409) {
        setMessage('❌ ' + (err.response.data?.message || 'Erreur de réservation.'));
      } else {
        setMessage('❌ Erreur serveur. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Chargement…</div>;
  if (!residence) return <div className="error">Résidence non trouvée</div>;

  const getTodayString = () => new Date().toISOString().split('T')[0];

  return (
    <div className="residence-details-container">
      {/* 📸 Section Galerie */}
      <div className="gallery-section">
        {residence.media?.length ? (
          <>
            <div className="main-image-container" onClick={() => setShowGallery(true)}>
              {residence.media[0].type === 'image' ? (
                <img src={`${API_URL}${residence.media[0].url}`} alt="Principal" className="main-image" />
              ) : (
                <video src={`${API_URL}${residence.media[0].url}`} controls className="main-image" />
              )}
            </div>
            {residence.media.length > 1 && (
              <div className="thumbnails-grid" onClick={() => setShowGallery(true)}>
                {residence.media.slice(1, 6).map((file, i) => (
                  <div key={i} className="thumbnail-container">
                    {file.type === 'image' ? (
                      <img src={`${API_URL}${file.url}`} alt={`Thumb ${i}`} className="thumbnail" />
                    ) : (
                      <video src={`${API_URL}${file.url}`} className="thumbnail" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : <div className="no-media">Aucun média disponible</div>}
      </div>

      {/* 🏠 Informations sur la résidence */}
      <div className="info-section">
        <div className="header-info">
          <span className="type-badge">{residence.type || 'Résidence'}</span>
          <h1 className="property-title">{residence.title}</h1>
          <div className="location-info">📍 {residence.location}</div>
          {residence.address && <div className="brand-info">{residence.address}</div>}
          <div className="accommodation-type">Hébergement</div>
        </div>

        <div className="description-section">
          <p>{residence.description}</p>
        </div>

        {residence.amenities?.length > 0 && (
          <div className="amenities-section">
            <h3>Équipements</h3>
            <div className="amenities-list">
              {residence.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">{amenity}</span>
              ))}
            </div>
          </div>
        )}

        {/* 📅 Section Réservation */}
        <div className="reservation-section">
          <h3>Période du séjour</h3>
          <div className="date-inputs">
            <div>
              <label>Du</label>
              <input
                type="date"
                name="startDate"
                value={reservation.startDate}
                onChange={handleChange}
                min={getTodayString()}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label>Au</label>
              <input
                type="date"
                name="endDate"
                value={reservation.endDate}
                onChange={handleChange}
                min={reservation.startDate || getTodayString()}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {nbJours > 0 && (
            <div className="price-summary">
              <p><strong>{nbJours}</strong> {nbJours > 1 ? 'nuits' : 'nuit'}</p>
              <p>{residence.price.toLocaleString()} FCFA / nuit</p>
              <p><strong>Total : {totalPrice.toLocaleString()} FCFA</strong></p>
            </div>
          )}

          <button
            onClick={handleReserve}
            disabled={isSubmitting || nbJours <= 0}
            className="reserve-button"
          >
            {isSubmitting ? 'Réservation en cours…' : 'Réserver maintenant'}
          </button>
          {message && <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        {/* 🔗 Partage Réseaux Sociaux */}
        <div className="social-share">
          <span>Partager sur :</span>
          <div className="social-buttons">
            <a href={`https://wa.me/?text=Découvrez cette résidence: ${residence.title} - ${window.location.href}`} target="_blank" rel="noopener">📱 WhatsApp</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener">📘 Facebook</a>
            <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener">🐦 Twitter</a>
            <button onClick={() => {
              if (navigator.share) {
                navigator.share({ title: residence.title, text: residence.description, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papier!');
              }
            }}>📤 Partager</button>
          </div>
        </div>
      </div>

      {/* 🖼️ Galerie plein écran */}
      {showGallery && (
        <div className="gallery-modal" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-gallery" onClick={() => setShowGallery(false)}>×</button>
            <Swiper modules={[Autoplay, Navigation, Pagination]} autoplay={{ delay: 3000 }} loop pagination navigation>
              {residence.media.map((file, i) => (
                <SwiperSlide key={i}>
                  {file.type === 'image'
                    ? <img src={`${API_URL}${file.url}`} alt={`Galerie ${i}`} className="gallery-slide" />
                    : <video src={`${API_URL}${file.url}`} controls className="gallery-slide" />}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidenceDetails;
