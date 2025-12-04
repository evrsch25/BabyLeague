// Service API pour communiquer avec le backend Prisma

// En production, utilise l'URL relative, en développement utilise localhost
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

// Fonction utilitaire pour les appels API
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur API' }));
      throw new Error(error.error || 'Erreur API');
    }

    return await response.json();
  } catch (error) {
    // Si c'est une erreur de connexion, on retourne un tableau vide ou null
    // pour ne pas planter l'application
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.warn('Serveur API non disponible. Assurez-vous que le serveur backend est démarré sur le port 3001.');
      // Retourner des valeurs par défaut selon le type de requête
      if (endpoint.includes('/matches')) return [];
      if (endpoint.includes('/players')) return [];
      return null;
    }
    console.error('Erreur API:', error);
    throw error;
  }
};

// Joueurs
export const getPlayers = async () => {
  return await fetchAPI('/players');
};

export const savePlayer = async (player) => {
  return await fetchAPI('/players', {
    method: 'POST',
    body: JSON.stringify(player)
  });
};

export const getPlayerById = async (id) => {
  return await fetchAPI(`/players/${id}`);
};

export const deletePlayer = async (id) => {
  return await fetchAPI(`/players/${id}`, {
    method: 'DELETE'
  });
};

// Matchs
export const getMatches = async () => {
  return await fetchAPI('/matches');
};

export const saveMatch = async (match) => {
  return await fetchAPI('/matches', {
    method: 'POST',
    body: JSON.stringify(match)
  });
};

export const getMatchById = async (id) => {
  return await fetchAPI(`/matches/${id}`);
};

// Utilisateur actuel (toujours dans localStorage pour la session)
export const getCurrentUser = () => {
  const user = localStorage.getItem('babyleague_current_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('babyleague_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('babyleague_current_user');
  }
};

// Statistiques
export const calculatePlayerStats = async (playerId, matchType = 'all') => {
  return await fetchAPI(`/players/${playerId}/stats?matchType=${matchType}`);
};

// Génération d'équipes équilibrées
export const generateBalancedTeams = async () => {
  const players = await getPlayers();
  if (players.length < 4) return null;

  // Trier les joueurs par nombre de matchs (ascendant)
  const playersWithStats = await Promise.all(
    players.map(async p => ({
      ...p,
      stats: await calculatePlayerStats(p.id, 'all')
    }))
  );

  const sorted = playersWithStats.sort((a, b) => a.stats.matches - b.stats.matches);

  // Prendre les 4 joueurs avec le moins de matchs pour les équipes
  const selectedPlayers = sorted.slice(0, 4);
  
  // Le 5e joueur (s'il existe) sera l'arbitre
  const referee = sorted.length >= 5 ? sorted[4] : null;
  
  // Mélanger pour créer des équipes variées
  const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
  
  return {
    team1: {
      players: [shuffled[0], shuffled[1]],
      score: 0
    },
    team2: {
      players: [shuffled[2], shuffled[3]],
      score: 0
    },
    referee: referee || null
  };
};

