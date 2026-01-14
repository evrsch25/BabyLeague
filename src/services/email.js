// Service pour envoyer des emails via EmailJS
// API externe : https://www.emailjs.com/

/**
 * Configuration EmailJS
 * 
 * Pour configurer :
 * 1. Créer un compte sur https://www.emailjs.com/
 * 2. Créer un service email (Gmail, Outlook, etc.)
 * 3. Créer un template d'email
 * 4. Récupérer :
 *    - Service ID
 *    - Template ID
 *    - Public Key
 * 5. Les sauvegarder dans les paramètres de l'app
 */

/**
 * Envoie un email de bienvenue à un nouveau joueur
 * @param {Object} player - Le joueur qui vient de s'inscrire
 * @param {string} player.name - Nom du joueur
 * @param {string} player.email - Email du joueur
 * @returns {Promise<boolean>} - true si envoyé, false sinon
 */
export const sendWelcomeEmail = async (player) => {
  // Récupérer la configuration EmailJS depuis localStorage
  const serviceId = localStorage.getItem('emailjs_service_id');
  const templateId = localStorage.getItem('emailjs_template_id');
  const publicKey = localStorage.getItem('emailjs_public_key');

  // Si pas configuré, ne pas envoyer (optionnel)
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS non configuré, email non envoyé');
    return false;
  }

  // Charger le SDK EmailJS dynamiquement
  if (!window.emailjs) {
    try {
      await loadEmailJSScript();
    } catch (error) {
      console.error('Erreur lors du chargement d\'EmailJS:', error);
      return false;
    }
  }

  // Initialiser EmailJS avec la clé publique
  window.emailjs.init(publicKey);

  // Paramètres du template
  const templateParams = {
    to_name: player.name,
    to_email: player.email,
    player_name: player.name,
    app_name: 'BabyLeague',
    app_url: window.location.origin,
    created_date: new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  };

  try {
    // 🌐 APPEL API EXTERNE vers EmailJS
    const response = await window.emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('Email envoyé avec succès:', response);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

/**
 * Envoie un email de notification de match terminé
 * @param {Object} match - Le match terminé
 * @param {Object} player - Le joueur à notifier
 * @returns {Promise<boolean>}
 */
export const sendMatchResultEmail = async (match, player) => {
  const serviceId = localStorage.getItem('emailjs_service_id');
  const templateId = localStorage.getItem('emailjs_match_template_id');
  const publicKey = localStorage.getItem('emailjs_public_key');

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS non configuré pour les résultats de match');
    return false;
  }

  if (!window.emailjs) {
    try {
      await loadEmailJSScript();
    } catch (error) {
      console.error('Erreur lors du chargement d\'EmailJS:', error);
      return false;
    }
  }

  window.emailjs.init(publicKey);

  // Déterminer si le joueur a gagné
  const isInTeam1 = match.team1.players.some(p => p.id === player.id);
  const isInTeam2 = match.team2.players.some(p => p.id === player.id);
  const won = (isInTeam1 && match.team1.score > match.team2.score) ||
              (isInTeam2 && match.team2.score > match.team1.score);

  const templateParams = {
    to_name: player.name,
    to_email: player.email,
    match_result: won ? 'Victoire' : 'Défaite',
    score: `${match.team1.score} - ${match.team2.score}`,
    team1_players: match.team1.players.map(p => p.name).join(' / '),
    team2_players: match.team2.players.map(p => p.name).join(' / '),
    app_url: window.location.origin
  };

  try {
    const response = await window.emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('Email de résultat envoyé:', response);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de résultat:', error);
    return false;
  }
};

/**
 * Teste la configuration EmailJS
 * @param {string} testEmail - Email de test
 * @returns {Promise<boolean>}
 */
export const testEmailConfiguration = async (testEmail) => {
  const serviceId = localStorage.getItem('emailjs_service_id');
  const templateId = localStorage.getItem('emailjs_template_id');
  const publicKey = localStorage.getItem('emailjs_public_key');

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Configuration EmailJS incomplète');
  }

  if (!window.emailjs) {
    await loadEmailJSScript();
  }

  window.emailjs.init(publicKey);

  const templateParams = {
    to_name: 'Testeur',
    to_email: testEmail,
    player_name: 'Testeur',
    app_name: 'BabyLeague',
    app_url: window.location.origin,
    created_date: new Date().toLocaleDateString('fr-FR')
  };

  try {
    await window.emailjs.send(serviceId, templateId, templateParams);
    return true;
  } catch (error) {
    console.error('Test EmailJS échoué:', error);
    throw error;
  }
};

/**
 * Charge le script EmailJS de manière dynamique
 * @returns {Promise}
 */
const loadEmailJSScript = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Échec du chargement d\'EmailJS'));

    document.head.appendChild(script);
  });
};
