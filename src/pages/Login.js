import React, { useState } from 'react';
import { getPlayers, savePlayer, setCurrentUser } from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (isSignup) {
        // Inscription
        const players = await getPlayers();
        const existingPlayer = players.find(p => p.email === email.toLowerCase());
        if (existingPlayer) {
          setError('Cet e-mail est déjà utilisé');
          return;
        }

        const newPlayer = {
          name: name.trim(),
          email: email.toLowerCase().trim()
        };

        const createdPlayer = await savePlayer(newPlayer);
        setCurrentUser(createdPlayer);
        onLogin(createdPlayer);
      } else {
        // Connexion
        const players = await getPlayers();
        const player = players.find(p => p.email === email.toLowerCase());
        if (!player) {
          setError('Aucun compte trouvé avec cet e-mail');
          return;
        }

        setCurrentUser(player);
        onLogin(player);
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🏓</div>
          <h1 className="login-title">BabyLeague</h1>
          <p className="login-subtitle">
            {isSignup ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn">
            {isSignup ? '✨ Créer mon compte' : '🚀 Se connecter'}
          </button>
        </form>

        <div className="login-switch">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="link-button"
          >
            {isSignup
              ? '← Déjà un compte ? Se connecter'
              : 'Pas encore de compte ? S\'inscrire →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

