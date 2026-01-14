// Service pour gérer les avatars via l'API DiceBear
// API externe : https://dicebear.com/

/**
 * Styles d'avatars disponibles (thème sportif/fun)
 */
export const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoon', description: 'Style cartoon coloré' },
  { id: 'bottts', name: 'Robot', description: 'Robot futuriste' },
  { id: 'adventurer', name: 'Aventurier', description: 'Personnage aventurier' },
  { id: 'big-smile', name: 'Grand sourire', description: 'Visage souriant' },
  { id: 'lorelei', name: 'Pixel Art', description: 'Style pixel art' },
  { id: 'personas', name: 'Personas', description: 'Personnage simple' },
  { id: 'thumbs', name: 'Pouce', description: 'Emoji pouce' },
  { id: 'fun-emoji', name: 'Emoji Fun', description: 'Emoji amusant' }
];

/**
 * Génère l'URL d'un avatar via l'API DiceBear
 * @param {string} seed - Identifiant unique (nom du joueur ou ID)
 * @param {string} style - Style d'avatar (voir AVATAR_STYLES)
 * @returns {string} URL de l'avatar
 */
export const getAvatarUrl = (seed, style = 'avataaars') => {
  // 🌐 APPEL API EXTERNE vers DiceBear
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=091C3E&radius=50`;
};

/**
 * Récupère le style d'avatar d'un joueur depuis player.avatarStyle ou localStorage
 * @param {Object|string} playerOrId - Le joueur ou son ID
 * @returns {string} Style d'avatar
 */
export const getPlayerAvatarStyle = (playerOrId) => {
  // Si c'est un objet player avec avatarStyle, l'utiliser
  if (typeof playerOrId === 'object' && playerOrId?.avatarStyle) {
    return playerOrId.avatarStyle;
  }
  
  // Sinon chercher dans localStorage
  const playerId = typeof playerOrId === 'string' ? playerOrId : playerOrId?.id;
  const styles = JSON.parse(localStorage.getItem('player_avatar_styles') || '{}');
  return styles[playerId] || 'avataaars'; // Style par défaut
};

/**
 * Sauvegarde le style d'avatar d'un joueur dans localStorage ET en BDD
 * @param {string} playerId - ID du joueur
 * @param {string} style - Style d'avatar choisi
 */
export const savePlayerAvatarStyle = async (playerId, style) => {
  // Sauvegarder dans localStorage
  const styles = JSON.parse(localStorage.getItem('player_avatar_styles') || '{}');
  styles[playerId] = style;
  localStorage.setItem('player_avatar_styles', JSON.stringify(styles));
  
  // Sauvegarder dans la BDD via l'API
  const { savePlayer, getPlayerById } = await import('./api');
  const player = await getPlayerById(playerId);
  if (player) {
    await savePlayer({
      ...player,
      avatarStyle: style
    });
  }
};

/**
 * Génère l'URL de l'avatar d'un joueur (retourne directement l'URL)
 * @param {Object} player - Le joueur
 * @param {string} player.id - ID du joueur
 * @param {string} player.name - Nom du joueur
 * @param {string} player.avatarStyle - Style d'avatar (optionnel)
 * @returns {string} URL de l'avatar
 */
export const getPlayerAvatar = (player) => {
  if (!player) return getAvatarUrl('anonymous', 'avataaars');
  
  const style = getPlayerAvatarStyle(player);
  const seed = player.name || player.id; // Utiliser le nom comme seed pour cohérence
  
  return getAvatarUrl(seed, style);
};
