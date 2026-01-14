import React, { useState, useEffect } from 'react';
import AlertModal from '../components/AlertModal';
import { testMakeConfiguration } from '../services/make';
import './Settings.css';

const Settings = () => {
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Configuration Make.com
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isTestingMake, setIsTestingMake] = useState(false);

  useEffect(() => {
    // Charger la configuration Make.com
    const savedUrl = localStorage.getItem('make_webhook_url');
    if (savedUrl) setMakeWebhookUrl(savedUrl);
  }, []);

  const handleSaveMakeConfig = () => {
    if (makeWebhookUrl.trim()) {
      if (!makeWebhookUrl.includes('make.com/') && !makeWebhookUrl.includes('integromat.com/')) {
        setShowAlert({
          isOpen: true,
          title: 'Erreur',
          message: 'L\'URL doit être une URL de webhook Make.com valide',
          type: 'error'
        });
        return;
      }
      
      localStorage.setItem('make_webhook_url', makeWebhookUrl.trim());
      setShowAlert({
        isOpen: true,
        title: 'Succès',
        message: 'Configuration Make.com enregistrée avec succès !',
        type: 'success'
      });
    } else {
      localStorage.removeItem('make_webhook_url');
      setShowAlert({
        isOpen: true,
        title: 'Info',
        message: 'Configuration Make.com supprimée',
        type: 'info'
      });
    }
  };

  const handleTestMake = async () => {
    if (!testEmail.trim()) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Veuillez entrer une adresse email',
        type: 'error'
      });
      return;
    }

    setIsTestingMake(true);

    try {
      await testMakeConfiguration(testEmail);
      setShowAlert({
        isOpen: true,
        title: 'Email envoyé !',
        message: `Un email de test a été envoyé à ${testEmail}. Vérifiez votre boîte de réception (code: 123456).`,
        type: 'success'
      });
    } catch (error) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: `Échec de l'envoi : ${error.message}. Vérifiez votre configuration Make.com.`,
        type: 'error'
      });
    } finally {
      setIsTestingMake(false);
    }
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <h1 className="settings-title">⚙️ Paramètres</h1>

        <div className="settings-section">
          <h2 className="section-title">📧 Validation par Email (Make.com)</h2>
          <p className="section-description">
            Envoyez automatiquement un code de validation par email aux nouveaux joueurs lors de leur inscription.
          </p>

          <div className="webhook-setup">
            <h3 className="setup-title">Comment configurer Make.com ?</h3>
            <ol className="setup-steps">
              <li>Créez un compte gratuit sur <a href="https://www.make.com/" target="_blank" rel="noopener noreferrer">make.com</a></li>
              <li>Créez un nouveau <strong>Scénario</strong></li>
              <li>Ajoutez un module <strong>"Webhook" → "Custom webhook"</strong> comme premier module</li>
              <li>Copiez l'<strong>URL du webhook</strong></li>
              <li>Ajoutez un module <strong>"Email" → "Send an email"</strong></li>
              <li>Configurez l'email :
                <ul>
                  <li><strong>To</strong> : <code>{'{{player_email}}'}</code></li>
                  <li><strong>Subject</strong> : Votre code de validation BabyLeague</li>
                  <li><strong>Content</strong> :
                    <br/><code>Bonjour {'{{player_name}}'}, <br/>Votre code de validation est : <strong>{'{{validation_code}}'}</strong></code>
                  </li>
                </ul>
              </li>
              <li>Activez le scénario</li>
              <li>Collez l'URL du webhook ci-dessous</li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="make-webhook-url" className="form-label">
              URL du Webhook Make.com
            </label>
            <input
              id="make-webhook-url"
              type="text"
              value={makeWebhookUrl}
              onChange={(e) => setMakeWebhookUrl(e.target.value)}
              placeholder="https://hook.eu1.make.com/..."
              className="form-input"
            />
          </div>

          <div className="button-group">
            <button 
              onClick={handleSaveMakeConfig} 
              className="btn btn-primary"
            >
              💾 Enregistrer
            </button>
          </div>

          {makeWebhookUrl && (
            <>
              <div className="webhook-status">
                <span className="status-indicator active"></span>
                <span className="status-text">Make.com configuré et actif</span>
              </div>

              <div className="email-test-section">
                <h3 className="setup-title">Tester l'envoi d'email</h3>
                <div className="form-group">
                  <label htmlFor="test-email" className="form-label">
                    Email de test
                  </label>
                  <input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="votre-email@example.com"
                    className="form-input"
                  />
                </div>
                <button 
                  onClick={handleTestMake} 
                  className="btn btn-secondary"
                  disabled={isTestingMake || !testEmail.trim()}
                >
                  {isTestingMake ? '⏳ Envoi en cours...' : '🧪 Envoyer un email de test'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="settings-section">
          <h2 className="section-title">ℹ️ À propos</h2>
          <div className="about-info">
            <p><strong>BabyLeague</strong> - Application de gestion de tournoi de babyfoot</p>
            <p className="version">Version 1.0.0</p>
          </div>
        </div>
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
};

export default Settings;
