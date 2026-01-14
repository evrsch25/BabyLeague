import React, { useState } from 'react';
import { getPlayers, savePlayer, setCurrentUser } from '../services/api';
import { sendValidationEmail, validateCode } from '../services/make';
import AlertModal from '../components/AlertModal';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  // État pour la validation du code
  const [pendingValidation, setPendingValidation] = useState(null); // {player, email}
  const [validationCode, setValidationCode] = useState('');
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

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
        
        // 📧 Envoyer un email de validation (API externe Make.com)
        try {
          const emailSent = await sendValidationEmail(createdPlayer);
          if (emailSent) {
            // Afficher le formulaire de validation
            setPendingValidation(createdPlayer);
            setShowAlert({
              isOpen: true,
              title: '📧 Email envoyé !',
              message: `Un code de validation a été envoyé à ${createdPlayer.email}. Vérifiez votre boîte de réception.`,
              type: 'success'
            });
          } else {
            // Si l'email n'a pas pu être envoyé, connecter quand même
            console.warn('Email non envoyé, connexion directe');
            setCurrentUser(createdPlayer);
            onLogin(createdPlayer);
          }
        } catch (emailError) {
          // Ne pas bloquer l'inscription si l'email échoue
          console.warn('Email de validation non envoyé:', emailError);
          setCurrentUser(createdPlayer);
          onLogin(createdPlayer);
        }
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

  const handleValidateCode = (e) => {
    e.preventDefault();
    
    if (!validationCode.trim()) {
      setError('Veuillez entrer le code de validation');
      return;
    }

    const isValid = validateCode(pendingValidation.id, validationCode);
    
    if (isValid) {
      // Code valide, connecter l'utilisateur
      setCurrentUser(pendingValidation);
      onLogin(pendingValidation);
      
      setShowAlert({
        isOpen: true,
        title: '✅ Compte validé !',
        message: 'Bienvenue sur BabyLeague ! Votre compte est maintenant actif.',
        type: 'success'
      });
    } else {
      setError('Code de validation incorrect ou expiré');
    }
  };

  const handleResendCode = async () => {
    if (pendingValidation) {
      const emailSent = await sendValidationEmail(pendingValidation);
      if (emailSent) {
        setShowAlert({
          isOpen: true,
          title: '📧 Code renvoyé',
          message: 'Un nouveau code de validation a été envoyé à votre adresse email.',
          type: 'success'
        });
      } else {
        setError('Erreur lors du renvoi du code');
      }
    }
  };

  // Si validation en attente, afficher le formulaire de code
  if (pendingValidation) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">⚽</div>
            <h1 className="login-title">Validation du compte</h1>
            <p className="login-subtitle">
              Entrez le code reçu par email
            </p>
          </div>

          <form onSubmit={handleValidateCode} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Code de validation (6 chiffres)</label>
              <input
                type="text"
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="validation-code-input"
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit">
              ✓ Valider mon compte
            </button>

            <div className="validation-help">
              <p>Email envoyé à : <strong>{pendingValidation.email}</strong></p>
              <button 
                type="button" 
                onClick={handleResendCode} 
                className="btn-link"
              >
                Renvoyer le code
              </button>
            </div>
          </form>
        </div>

        {showAlert.isOpen && (
          <AlertModal
            title={showAlert.title}
            message={showAlert.message}
            type={showAlert.type}
            onClose={() => setShowAlert({ ...showAlert, isOpen: false })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">⚽</div>
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

