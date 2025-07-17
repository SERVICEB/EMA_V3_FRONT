import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import './Header.css';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuthStatus();

    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="home-icon-link">
          <House className="home-icon" />
        </Link>
        <div className="logo">
          <span className="logo-main">EMA</span>
          <span className="logo-sub">Résidences</span>
        </div>
      </div>

      <nav className="nav">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="nav-link logout-button">
            Se déconnecter
          </button>
        ) : (
          <>
            <Link to="/inscription" className="nav-link">S'inscrire</Link>
            <Link to="/connexion" className="nav-link">Se connecter</Link>
          </>
        )}
      </nav>
    </header>
  );
}
