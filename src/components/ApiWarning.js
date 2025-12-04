import React, { useState, useEffect } from 'react';
import './ApiWarning.css';

const ApiWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Vérifier si le serveur API est disponible
    const checkApi = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/players');
        if (!response.ok) {
          setShowWarning(true);
        }
      } catch (error) {
        setShowWarning(true);
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="api-warning">
      <div className="api-warning-content">
        <span className="api-warning-icon">⚠️</span>
        <div className="api-warning-text">
          <strong>Serveur backend non disponible</strong>
          <p>Assurez-vous que le serveur est démarré : <code>cd server && npm run dev</code></p>
        </div>
        <button 
          className="api-warning-close"
          onClick={() => setShowWarning(false)}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ApiWarning;

