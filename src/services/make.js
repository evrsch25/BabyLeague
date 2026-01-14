// Service pour envoyer des emails via Make.com (anciennement Integromat)
// API externe très simple : https://www.make.com/

/**
 * Configuration Make.com
 * 
 * Pour configurer :
 * 1. Créer un compte sur https://www.make.com/ (gratuit)
 * 2. Créer un nouveau scénario
 * 3. Ajouter un module "Webhook" comme déclencheur
 * 4. Copier l'URL du webhook
 * 5. Ajouter un module "Email" pour envoyer l'email
 * 6. Activer le scénario
 * 7. Coller l'URL dans les paramètres de l'app
 */

/**
 * Envoie un email de validation via Make.com
 * @param {Object} player - Le joueur qui vient de s'inscrire
 * @param {string} player.id - ID du joueur
 * @param {string} player.name - Nom du joueur
 * @param {string} player.email - Email du joueur
 * @returns {Promise<boolean>} - true si envoyé, false sinon
 */
export const sendValidationEmail = async (player) => {
  // Récupérer l'URL du webhook Make.com depuis localStorage
  const makeWebhookUrl = localStorage.getItem('make_webhook_url');

  // Si pas configuré, ne pas envoyer (optionnel)
  if (!makeWebhookUrl) {
    console.warn('Make.com non configuré, email non envoyé');
    return false;
  }

  // Générer un code de validation simple (6 chiffres)
  const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Stocker temporairement le code dans localStorage avec l'ID du joueur
  const pendingValidations = JSON.parse(localStorage.getItem('pending_validations') || '{}');
  pendingValidations[player.id] = {
    code: validationCode,
    email: player.email,
    name: player.name,
    timestamp: Date.now()
  };
  localStorage.setItem('pending_validations', JSON.stringify(pendingValidations));

  // Données à envoyer à Make.com
  const data = {
    player_id: player.id,
    player_name: player.name,
    player_email: player.email,
    validation_code: validationCode,
    app_name: 'BabyLeague',
    app_url: window.location.origin,
    created_date: new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  };

  try {
    // 🌐 APPEL API EXTERNE vers Make.com
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log('Email de validation envoyé via Make.com');
      return true;
    } else {
      console.error('Erreur Make.com:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi à Make.com:', error);
    return false;
  }
};

/**
 * Vérifie un code de validation
 * @param {string} playerId - ID du joueur
 * @param {string} code - Code de validation saisi
 * @returns {boolean} - true si valide, false sinon
 */
export const validateCode = (playerId, code) => {
  const pendingValidations = JSON.parse(localStorage.getItem('pending_validations') || '{}');
  const validation = pendingValidations[playerId];

  if (!validation) {
    console.error('Aucune validation en attente pour ce joueur');
    return false;
  }

  // Vérifier que le code n'a pas expiré (30 minutes)
  const thirtyMinutes = 30 * 60 * 1000;
  if (Date.now() - validation.timestamp > thirtyMinutes) {
    console.error('Code de validation expiré');
    delete pendingValidations[playerId];
    localStorage.setItem('pending_validations', JSON.stringify(pendingValidations));
    return false;
  }

  // Vérifier le code
  if (validation.code === code.trim()) {
    // Code valide, supprimer de la liste en attente
    delete pendingValidations[playerId];
    localStorage.setItem('pending_validations', JSON.stringify(pendingValidations));
    return true;
  }

  console.error('Code de validation incorrect');
  return false;
};

/**
 * Teste la configuration Make.com
 * @param {string} testEmail - Email de test
 * @returns {Promise<boolean>}
 */
export const testMakeConfiguration = async (testEmail) => {
  const makeWebhookUrl = localStorage.getItem('make_webhook_url');

  if (!makeWebhookUrl) {
    throw new Error('URL du webhook Make.com non configurée');
  }

  const testData = {
    player_id: 'test_' + Date.now(),
    player_name: 'Testeur',
    player_email: testEmail,
    validation_code: '123456',
    app_name: 'BabyLeague',
    app_url: window.location.origin,
    created_date: new Date().toLocaleDateString('fr-FR')
  };

  try {
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      return true;
    } else {
      throw new Error(`Erreur ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    console.error('Test Make.com échoué:', error);
    throw error;
  }
};
