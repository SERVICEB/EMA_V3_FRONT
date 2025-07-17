const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './NewAnnoncePage.css';

const AddAnnonce = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    typeAnnonce: '',
    typeBien: '',
    prix: '',
    superficie: '',
    description: '',
    chambres: '',
    salons: '',
    cuisines: '',
    sallesBain: '',
    toilettes: '',
    balcon: false,
    garage: false,
    piscine: false,
    ville: '',
    quartier: '',
    nomContact: '',
    telephone: '',
    email: '',
    images: [],
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const limitedFiles = files.slice(0, 10 - formData.images.length);
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...limitedFiles],
    }));
  };

  const removeImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();

    const keysToConvert = [
      'prix', 'superficie', 'chambres', 'salons', 'cuisines', 'sallesBain', 'toilettes'
    ];

    for (const key in formData) {
      if (key === 'images') continue;

      if (typeof formData[key] === 'boolean') {
        payload.append(key, formData[key].toString());
      } else if (keysToConvert.includes(key)) {
        payload.append(key, formData[key] ? Number(formData[key]) : '');
      } else {
        payload.append(key, formData[key]);
      }
    }

    formData.images.forEach((file) => {
      payload.append('images', file);
    });

    // ✅ Récupère le token
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(`${API_URL}/api/annonces`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // ← Ajout du token ici
        },
      });
      alert('Annonce enregistrée avec succès !');
      console.log(res.data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi :', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Vous devez être connecté pour publier une annonce.');
      } else {
        alert('Erreur lors de l’enregistrement.');
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className={`step-circle ${currentStep === step ? 'active' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <h2>Type d'annonce</h2>
      <div className="grid-2">
        <div>
          <label>Type d'annonce</label>
          <select name="typeAnnonce" value={formData.typeAnnonce} onChange={handleInputChange}>
            <option value="">Choisir</option>
            <option value="location">Location</option>
            <option value="vente">Vente</option>
          </select>
        </div>
        <div>
          <label>Type de bien</label>
          <select name="typeBien" value={formData.typeBien} onChange={handleInputChange}>
            <option value="">Choisir</option>
            <option value="studio">Studio</option>
            <option value="appartement">Appartement</option>
            <option value="villa">Villa</option>
            <option value="chambre">Chambre</option>
            <option value="bureau">Bureau</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h2>Détails du bien</h2>
      <div className="grid-3">
        {['prix', 'superficie', 'chambres', 'salons', 'cuisines', 'sallesBain', 'toilettes'].map((field) => (
          <div key={field}>
            <label>{field}</label>
            <input type="number" name={field} value={formData[field]} onChange={handleInputChange} />
          </div>
        ))}
      </div>
      <label>Description</label>
      <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} />
      <div className="checkbox-group">
        {['balcon', 'garage', 'piscine'].map((field) => (
          <label key={field}>
            <input type="checkbox" name={field} checked={formData[field]} onChange={handleInputChange} />
            {field}
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h2>Localisation</h2>
      <div className="grid-2">
        <div>
          <label>Ville</label>
          <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} />
        </div>
        <div>
          <label>Quartier</label>
          <input type="text" name="quartier" value={formData.quartier} onChange={handleInputChange} />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h2>Contact & Images</h2>
      <div className="grid-2">
        <div>
          <label>Nom</label>
          <input type="text" name="nomContact" value={formData.nomContact} onChange={handleInputChange} />
        </div>
        <div>
          <label>Téléphone</label>
          <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} />
        </div>
        <div className="col-span-2">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
        </div>
      </div>
      <div>
        <label>Photos</label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <div className="preview-grid">
          {formData.images.map((img, i) => (
            <div key={i} className="preview-img">
              <img src={URL.createObjectURL(img)} alt={`preview-${i}`} />
              <button type="button" onClick={() => removeImage(i)}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="add-annonce-form">
      {renderStepIndicator()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      <div className="form-footer">
        {currentStep > 1 && (
          <button type="button" onClick={prevStep} className="btn secondary">Précédent</button>
        )}
        {currentStep < totalSteps ? (
          <button type="button" onClick={nextStep} className="btn primary">Suivant</button>
        ) : (
          <button type="submit" className="btn success">Créer l'annonce</button>
        )}
      </div>
    </form>
  );
};

export default AddAnnonce;
