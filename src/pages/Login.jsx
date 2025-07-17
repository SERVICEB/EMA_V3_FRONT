
const API_URL = import.meta.env.VITE_API_URL || 'https://emaprojetbackend.onrender.com';
import React, { useState } from 'react';
import axios from 'axios';
import { MdEmail, MdLock } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const res = await axios.post(`${API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // ✅ Modification : récupérer firstName et lastName au lieu de name
      const { token, _id, firstName, lastName, email, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        _id, 
        firstName, 
        lastName, 
        fullName: `${firstName} ${lastName}`, // Créer fullName pour compatibilité
        email, 
        role 
      }));

      window.dispatchEvent(new Event('authChange'));

      setMessage("✅ Connexion réussie !");

      // Redirection selon rôle
      setTimeout(() => {
        if (role === 'client') {
          navigate('/client/dashboard');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            setMessage("❌ Données invalides. Vérifiez vos informations.");
            break;
          case 401:
            setMessage("❌ Email ou mot de passe incorrect !");
            break;
          case 404:
            setMessage("❌ Utilisateur non trouvé !");
            break;
          case 500:
            setMessage("❌ Erreur serveur. Veuillez réessayer plus tard.");
            break;
          default:
            setMessage(data?.message || "❌ Une erreur est survenue.");
        }
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        setMessage("❌ Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        // Autre erreur
        setMessage("❌ Une erreur inattendue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Connexion</h2>
        {message && (
          <div className={`auth-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !formData.email || !formData.password}
            className="auth-button"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}