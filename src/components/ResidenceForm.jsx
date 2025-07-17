// ResidenceForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './ResidenceForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';
axios.defaults.baseURL = API_URL;

const ResidenceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pour l'édition
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).id : null;
  const isEditing = Boolean(id);

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    reference: '', // ✅ Ajouté
    type: 'Appartement',
    category: '',
    prixParNuit: '',
  });

  // État pour les médias
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Types de résidence disponibles
  const residenceTypes = [
    'Appartement',
    'Maison',
    'Villa',
    'Studio',
    'Chambre',
    'Hôtel',
    'Gîte',
    'Autre'
  ];

  // Catégories disponibles
  const categories = [
    'Standard',
    'Premium',
    'Luxe',
    'Économique',
    'Famille',
    'Business'
  ];

  // Charger les données en mode édition
  useEffect(() => {
    if (isEditing) {
      loadResidenceData();
    }
  }, [id, isEditing]);

  // Redirection si non connecté
  useEffect(() => {
    if (!userId) {
      navigate('/connexion');
    }
  }, [userId, navigate]);

  const loadResidenceData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/residences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        address: data.address || '',
        reference: data.reference || '', // ✅ Ajouté
        type: data.type || 'Appartement',
        category: data.category || '',
        prixParNuit: data.price || '', // ✅ Correction: data.price au lieu de data.prixParNuit
      });
      
      setExistingMedia(data.media || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage('❌ Erreur lors du chargement de la résidence');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      return (isImage || isVideo) && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setMessage('⚠️ Certains fichiers ont été ignorés (format non supporté ou taille > 10MB)');
    }

    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeNewMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (mediaId) => {
    if (!mediaId) return;
    
    setMediaToDelete(prev => [...prev, mediaId]);
    setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    const prix = parseFloat(formData.prixParNuit);
    if (!formData.prixParNuit || isNaN(prix) || prix <= 0) {
      newErrors.prixParNuit = 'Le prix par nuit doit être supérieur à 0';
    }

    // Vérifier les médias seulement en mode création
    if (!isEditing && mediaFiles.length === 0) {
      newErrors.media = 'Au moins une image ou vidéo est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ BLOC DE CODE CORRIGÉ - handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('❌ Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setLoading(true);
      setMessage(''); // Clear previous messages
      
      const formDataToSend = new FormData();

      // ✅ CORRECTION: Utilisation de Object.entries et mapping correct des champs
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Conversion en string pour éviter les erreurs de type
          const stringValue = typeof value === 'string' ? value : String(value);
          
          if (key === 'prixParNuit') {
            formDataToSend.append('price', stringValue); // ✅ Correction: prixParNuit -> price
          } else if (key === 'reference') {
            // Skip reference ici, on le gère séparément ci-dessous
            return;
          } else if (key !== 'category') { // ✅ Exclure category si pas géré côté backend
            formDataToSend.append(key, stringValue);
          }
        }
      });

      // ✅ AJOUT: Gestion spécifique pour reference (seulement si non vide)
      if (formData.reference && typeof formData.reference === 'string' && formData.reference.trim() !== '') {
        formDataToSend.append('reference', formData.reference.trim());
      }

      // ✅ AJOUT: Ajout du champ amenities temporaire
      formDataToSend.append('amenities', JSON.stringify([])); // temporaire

      // Ajouter l'ID utilisateur
      if (userId) {
        formDataToSend.append('userId', userId);
      }

      // Ajouter les nouveaux fichiers média
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formDataToSend.append('media', file);
        });
      }

      // Ajouter les médias à supprimer en mode édition
      if (isEditing && mediaToDelete.length > 0) {
        formDataToSend.append('mediaToDelete', JSON.stringify(mediaToDelete));
      }

      // Debug: Afficher le contenu du FormData de manière plus détaillée
      console.log('=== DEBUGGING FORMDATA ===');
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== END DEBUGGING ===');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
          // Ne pas définir Content-Type, axios le fera automatiquement pour FormData
        }
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/residences/${id}`, formDataToSend, config);
      } else {
        response = await axios.post('/api/residences', formDataToSend, config);
      }

      setMessage(`✅ Résidence ${isEditing ? 'modifiée' : 'créée'} avec succès !`);
      
      // Forcer un rechargement complet de la page après un court délai
      console.log('Redirection vers la page d\'accueil...');
      
      // Utiliser window.location.href pour forcer un rechargement complet
      // avec un léger délai pour permettre l'affichage du message de succès
      setTimeout(() => {
        console.log('Redirection en cours...');
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      console.error('Response status:', error.response?.status);
      console.error('Full error object:', error);
      
      let errorMessage = 'Erreur lors de la soumission';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Erreur serveur: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      address: '',
      reference: '', // ✅ Ajouté
      type: 'Appartement',
      category: '',
      prixParNuit: '',
    });
    setMediaFiles([]);
    setExistingMedia([]);
    setMediaToDelete([]);
    setErrors({});
    setMessage('');
  };

  if (loading && isEditing) {
    return <div className="loading">Chargement des données...</div>;
  }

  return (
    <div className="residence-form-container">
      <div className="form-header">
        <h1>{isEditing ? '✏️ Modifier la résidence' : '➕ Ajouter une nouvelle résidence'}</h1>
        <p className="form-subtitle">
          {isEditing 
            ? 'Modifiez les informations de votre résidence'
            : 'Remplissez les informations de votre résidence pour la publier'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="residence-form">
        {/* Informations de base */}
        <div className="form-section">
          <h2 className="section-title">📋 Informations générales</h2>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Titre de la résidence *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Ex: Magnifique appartement avec vue sur mer"
              maxLength="100"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Décrivez votre résidence en détail..."
              rows="5"
              maxLength="1000"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <div className="char-counter">
              {formData.description.length}/1000 caractères
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="form-section">
          <h2 className="section-title">📍 Localisation</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Ville/Région *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`form-input ${errors.location ? 'error' : ''}`}
                placeholder="Ex: Abidjan, Cocody"
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Adresse complète
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ex: Rue des Jardins, Quartier Riviera"
              />
            </div>
          </div>

          {/* ✅ AJOUT: Champ reference */}
          <div className="form-group">
            <label htmlFor="reference" className="form-label">
              Référence (optionnel)
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ex: REF-2024-001"
              maxLength="50"
            />
          </div>
        </div>

        {/* Type et catégorie */}
        <div className="form-section">
          <h2 className="section-title">🏠 Type et catégorie</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Type de résidence *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                {residenceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prix */}
        <div className="form-section">
          <h2 className="section-title">💰 Tarification</h2>
          
          <div className="form-group">
            <label htmlFor="prixParNuit" className="form-label">
              Prix par nuit (FCFA) *
            </label>
            <input
              type="number"
              id="prixParNuit"
              name="prixParNuit"
              value={formData.prixParNuit}
              onChange={handleInputChange}
              className={`form-input ${errors.prixParNuit ? 'error' : ''}`}
              placeholder="Ex: 25000"
              min="0"
              step="1000"
            />
            {errors.prixParNuit && <span className="error-message">{errors.prixParNuit}</span>}
          </div>
        </div>

        {/* Médias */}
        <div className="form-section">
          <h2 className="section-title">📸 Photos et vidéos</h2>
          
          {/* Médias existants (en mode édition) */}
          {isEditing && existingMedia.length > 0 && (
            <div className="existing-media">
              <h3 className="subsection-title">Médias actuels</h3>
              <div className="media-grid">
                {existingMedia.map((media, index) => (
                  <div key={media.id || `existing-${index}`} className="media-item">
                    {media.type === 'image' ? (
                      <img
                        src={`${API_URL}${media.url}`}
                        alt={`Media ${index + 1}`}
                        className="media-preview"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                          console.warn('Image failed to load:', media.url);
                        }}
                      />
                    ) : (
                      <video
                        src={`${API_URL}${media.url}`}
                        className="media-preview"
                        controls
                        onError={(e) => {
                          console.warn('Video failed to load:', media.url);
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(media.id)}
                      className="remove-media-btn"
                      title="Supprimer ce média"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouveaux médias */}
          <div className="form-group">
            <label htmlFor="media" className="form-label">
              {isEditing ? 'Ajouter de nouveaux médias' : 'Photos/Vidéos *'}
            </label>
            <input
              type="file"
              id="media"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="form-file-input"
            />
            <div className="file-input-info">
              Formats acceptés: JPG, PNG, MP4, etc. Taille max: 10MB par fichier
            </div>
            {errors.media && <span className="error-message">{errors.media}</span>}
          </div>

          {/* Aperçu des nouveaux médias */}
          {mediaFiles.length > 0 && (
            <div className="new-media">
              <h3 className="subsection-title">Nouveaux médias à ajouter</h3>
              <div className="media-grid">
                {mediaFiles.map((file, index) => (
                  <div key={`new-${index}-${file.name}`} className="media-item">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Nouveau média ${index + 1}`}
                        className="media-preview"
                        onError={(e) => {
                          console.warn('Failed to create object URL for:', file.name);
                        }}
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="media-preview"
                        controls
                        onError={(e) => {
                          console.warn('Failed to create object URL for video:', file.name);
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewMedia(index)}
                      className="remove-media-btn"
                      title="Supprimer ce média"
                    >
                      ×
                    </button>
                    <div className="media-name" title={file.name}>
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message de statut */}
        {message && (
          <div className={`form-message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          
          {!isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
              disabled={loading}
            >
              Réinitialiser
            </button>
          )}
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {isEditing ? 'Modification...' : 'Création...'}
              </>
            ) : (
              <>
                {isEditing ? '✏️ Modifier' : '➕ Créer'} la résidence
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;