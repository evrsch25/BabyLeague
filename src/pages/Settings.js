import React, { useState, useEffect } from 'react';
import AlertModal from '../components/AlertModal';
import { testEmailConfiguration } from '../services/email';
import './Settings.css';

const Settings = () => {
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Configuration EmailJS
  const [emailServiceId, setEmailServiceId] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailPublicKey, setEmailPublicKey] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    // Charger la configuration EmailJS
    const savedServiceId = localStorage.getItem('emailjs_service_id');
    const savedTemplateId = localStorage.getItem('emailjs_template_id');
    const savedPublicKey = localStorage.getItem('emailjs_public_key');
    
    if (savedServiceId) setEmailServiceId(savedServiceId);
    if (savedTemplateId) setEmailTemplateId(savedTemplateId);
    if (savedPublicKey) setEmailPublicKey(savedPublicKey);
  }, []);

  const handleSaveEmailConfig = () => {
    if (emailServiceId.trim() && emailTemplateId.trim() && emailPublicKey.trim()) {
      localStorage.setItem('emailjs_service_id', emailServiceId.trim());
      localStorage.setItem('emailjs_template_id', emailTemplateId.trim());
      localStorage.setItem('emailjs_public_key', emailPublicKey.trim());
      
      setShowAlert({
        isOpen: true,
        title: 'Succès',
        message: 'Configuration EmailJS enregistrée avec succès !',
        type: 'success'
      });
    } else if (!emailServiceId.trim() && !emailTemplateId.trim() && !emailPublicKey.trim()) {
      localStorage.removeItem('emailjs_service_id');
      localStorage.removeItem('emailjs_template_id');
      localStorage.removeItem('emailjs_public_key');
      
      setShowAlert({
        isOpen: true,
        title: 'Info',
        message: 'Configuration EmailJS supprimée',
        type: 'info'
      });
    } else {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs ou les laisser tous vides',
        type: 'error'
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Veuillez entrer une adresse email',
        type: 'error'
      });
      return;
    }

    setIsTestingEmail(true);

    try {
      await testEmailConfiguration(testEmail);
      setShowAlert({
        isOpen: true,
        title: 'Email envoyé !',
        message: `Un email de test a été envoyé à ${testEmail}. Vérifiez votre boîte de réception (et les spams).`,
        type: 'success'
      });
    } catch (error) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: `Échec de l'envoi : ${error.message}. Vérifiez votre configuration EmailJS.`,
        type: 'error'
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <h1 className="settings-title">⚙️ Paramètres</h1>

        <div className="settings-section">
          <h2 className="section-title">📧 Notifications Email (EmailJS)</h2>
          <p className="section-description">
            Envoyez automatiquement des emails de bienvenue aux nouveaux joueurs lors de leur inscription.
          </p>

          <div className="webhook-setup">
            <h3 className="setup-title">Comment configurer EmailJS ?</h3>
            <ol className="setup-steps">
              <li>Créez un compte gratuit sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer">emailjs.com</a></li>
              <li>Allez dans <strong>Email Services</strong> → Ajoutez un service (Gmail, Outlook, etc.)</li>
              <li>Notez le <strong>Service ID</strong></li>
              <li>Allez dans <strong>Email Templates</strong> → Créez un nouveau template</li>
              <li>Utilisez ces variables dans votre template :
                <ul>
                  <li><code>{'{{to_name}}'}</code> - Nom du destinataire</li>
                  <li><code>{'{{player_name}}'}</code> - Nom du joueur</li>
                  <li><code>{'{{app_name}}'}</code> - Nom de l'app (BabyLeague)</li>
                  <li><code>{'{{created_date}}'}</code> - Date d'inscription</li>
                </ul>
              </li>
              <li>Notez le <strong>Template ID</strong></li>
              <li>Allez dans <strong>Account</strong> → <strong>General</strong> → Copiez la <strong>Public Key</strong></li>
              <li>Collez les 3 informations ci-dessous</li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="email-service-id" className="form-label">
              Service ID
            </label>
            <input
              id="email-service-id"
              type="text"
              value={emailServiceId}
              onChange={(e) => setEmailServiceId(e.target.value)}
              placeholder="service_xxxxxxx"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-template-id" className="form-label">
              Template ID
            </label>
            <input
              id="email-template-id"
              type="text"
              value={emailTemplateId}
              onChange={(e) => setEmailTemplateId(e.target.value)}
              placeholder="template_xxxxxxx"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-public-key" className="form-label">
              Public Key
            </label>
            <input
              id="email-public-key"
              type="text"
              value={emailPublicKey}
              onChange={(e) => setEmailPublicKey(e.target.value)}
              placeholder="xxxxxxxxxxxxxx"
              className="form-input"
            />
          </div>

          <div className="button-group">
            <button 
              onClick={handleSaveEmailConfig} 
              className="btn btn-primary"
            >
              💾 Enregistrer la configuration
            </button>
          </div>

          {emailServiceId && emailTemplateId && emailPublicKey && (
            <>
              <div className="webhook-status">
                <span className="status-indicator active"></span>
                <span className="status-text">EmailJS configuré et actif</span>
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
                  onClick={handleTestEmail} 
                  className="btn btn-secondary"
                  disabled={isTestingEmail || !testEmail.trim()}
                >
                  {isTestingEmail ? '⏳ Envoi en cours...' : '🧪 Envoyer un email de test'}
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
