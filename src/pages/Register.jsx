const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { register } from '../api/api';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validation côté client
      if (!formData.firstName.trim()) {
        setMessage('❌ Le prénom est requis');
        setLoading(false);
        return;
      }

      if (!formData.lastName.trim()) {
        setMessage('❌ Le nom est requis');
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setMessage('❌ L\'email est requis');
        setLoading(false);
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        setMessage('❌ Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }

      // Nettoyer les données
      const cleanData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      const { token } = await register(cleanData);
      localStorage.setItem('token', token);

      setMessage('✅ Inscription réussie ! Redirection...');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      
      if (err.response) {
        const errorData = err.response.data;
        console.log('Détails de l\'erreur:', errorData);
        
        if (errorData.message) {
          setMessage(`❌ ${errorData.message}`);
        } else if (errorData.error) {
          setMessage(`❌ ${errorData.error}`);
        } else {
          setMessage(`❌ Erreur lors de l'inscription`);
        }
      } else if (err.request) {
        setMessage('❌ Impossible de contacter le serveur');
      } else {
        setMessage('❌ Une erreur inattendue s\'est produite');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        {message && (
          <p className={`auth-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="lastName"
              placeholder="Nom de famille"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <MdEmail className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <MdLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <div className="input-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="auth-select"
              disabled={loading}
            >
              <option value="client">Client</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password}
          >
            {loading ? "Création en cours..." : "S'inscrire"}
          </button>
        </form>
        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}