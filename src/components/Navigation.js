import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Navigation.css';

const Navigation = ({ currentUser, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">BabyLeague</span>
        </Link>
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/')}>
              🏠 Accueil
            </Link>
          </li>
          <li>
            <Link to="/ranking" className={isActive('/ranking')}>
              🏆 Compétition
            </Link>
          </li>
          <li>
            <Link to={`/profile/${currentUser?.id}`} className={isActive(`/profile/${currentUser?.id}`)}>
              👤 Profil
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          <button onClick={onLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" className={isActive('/')} onClick={() => setMobileMenuOpen(false)}>
          🏠 Accueil
        </Link>
        <Link to="/ranking" className={isActive('/ranking')} onClick={() => setMobileMenuOpen(false)}>
          🏆 Compétition
        </Link>
        <Link to={`/profile/${currentUser?.id}`} className={isActive(`/profile/${currentUser?.id}`)} onClick={() => setMobileMenuOpen(false)}>
          👤 Profil
        </Link>
        <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn-logout mobile-logout">
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

