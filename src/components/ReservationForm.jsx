// ResidenceForm.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './ResidenceForm.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResidenceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).id : null;
  const isEditing = Boolean(id);

  // ✅ CORRECTION: État du formulaire aligné avec le schéma backend
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    reference: '',
    type: 'Appartement', // ✅ Valeur par défaut valide selon l'enum
    price: '', // ✅ CORRECTION: price au lieu de prixParNuit
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // ✅ CORRECTION: Types alignés avec l'enum du schéma
  const residenceTypes = [
    'Hôtel',
    'Appartement', 
    'Villa',
    'Studio',
    'Suite',
    'Chambre'
  ];

  // Charger les données en mode édition
  useEffect(() => {
    if (isEditing) {
      loadResidenceData();
    }
  }, [id, isEditing]);

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
        reference: data.reference || '',
        type: data.type || 'Appartement',
        price: data.price || '', // ✅ CORRECTION: price au lieu de prixParNuit
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
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
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

    if (!formData.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    // ✅ CORRECTION: Validation du prix avec les contraintes du schéma
    const prix = parseFloat(formData.price);
    if (!formData.price || isNaN(prix) || prix < 1000 || prix > 1000000) {
      newErrors.price = 'Le prix doit être entre 1000 et 1000000 FCFA';
    }

    if (!isEditing && mediaFiles.length === 0) {
      newErrors.media = 'Au moins une image ou vidéo est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('❌ Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const formDataToSend = new FormData();

      // ✅ CORRECTION: Ajout des champs requis seulement
      const requiredFields = ['title', 'location', 'type'];
      const optionalFields = ['description', 'address'];

      // Champs requis
      requiredFields.forEach(field => {
        if (formData[field]?.trim()) {
          formDataToSend.append(field, formData[field].trim());
        }
      });

      // Champs optionnels
      optionalFields.forEach(field => {
        if (formData[field]?.trim()) {
          formDataToSend.append(field, formData[field].trim());
        }
      });

      // ✅ CORRECTION: Prix avec validation
      const price = parseFloat(formData.price);
      if (!isNaN(price) && price >= 1000 && price <= 1000000) {
        formDataToSend.append('price', price.toString());
      }

      // ✅ CORRECTION: Référence seulement si non vide
      if (formData.reference?.trim()) {
        formDataToSend.append('reference', formData.reference.trim());
      }

      // ✅ CORRECTION: Ajouter userId comme owner
      if (userId) {
        formDataToSend.append('owner', userId); // ✅ Utiliser 'owner' au lieu de 'userId'
      }

      // ✅ CORRECTION: Amenities comme tableau vide par défaut
      formDataToSend.append('amenities', JSON.stringify([]));

      // Ajouter les fichiers média
      if (mediaFiles?.length > 0) {
        mediaFiles.forEach((file) => {
          formDataToSend.append('media', file);
        });
      }

      // Médias existants en mode édition
      if (isEditing) {
        const existingImages = existingMedia.map(media => ({
          url: media.url,
          type: media.type
        }));
        formDataToSend.append('existingImages', JSON.stringify(existingImages));

        if (mediaToDelete.length > 0) {
          formDataToSend.append('mediaToDelete', JSON.stringify(mediaToDelete));
        }
      }

      // ✅ DEBUG: Affichage propre du FormData
      console.log('=== FORM DATA DEBUG ===');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== END DEBUG ===');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type sera automatiquement défini par axios pour FormData
        }
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/residences/${id}`, formDataToSend, config);
      } else {
        response = await axios.post('/api/residences', formDataToSend, config);
      }

      setMessage(`✅ Résidence ${isEditing ? 'modifiée' : 'créée'} avec succès !`);
      
      // ✅ CORRECTION: Navigation plus robuste
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      let errorMessage = 'Erreur lors de la soumission';
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = 'Données invalides. Vérifiez tous les champs requis.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => navigate('/connexion'), 2000);
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
      reference: '',
      type: 'Appartement',
      price: '',
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

        {/* Type */}
        <div className="form-section">
          <h2 className="section-title">🏠 Type de résidence</h2>
          
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
        </div>

        {/* Prix */}
        <div className="form-section">
          <h2 className="section-title">💰 Tarification</h2>
          
          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Prix par nuit (FCFA) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`form-input ${errors.price ? 'error' : ''}`}
              placeholder="Ex: 25000"
              min="1000"
              max="1000000"
              step="1000"
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
            <div className="form-help">
              Prix entre 1 000 et 1 000 000 FCFA
            </div>
          </div>
        </div>

        {/* Médias */}
        <div className="form-section">
          <h2 className="section-title">📸 Photos et vidéos</h2>
          
          {isEditing && existingMedia.length > 0 && (
            <div className="existing-media">
              <h3 className="subsection-title">Médias actuels</h3>
              <div className="media-grid">
                {existingMedia.map((media, index) => (
                  <div key={media.id || `existing-${index}`} className="media-item">
                    {media.type === 'image' ? (
                      <img
                        src={`http://localhost:5000${media.url}`}
                        alt={`Media ${index + 1}`}
                        className="media-preview"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <video
                        src={`http://localhost:5000${media.url}`}
                        className="media-preview"
                        controls
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
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="media-preview"
                        controls
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

        {message && (
          <div className={`form-message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

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