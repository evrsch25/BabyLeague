// Service de gestion du stockage local (simulation d'une base de données)

const STORAGE_KEYS = {
  PLAYERS: 'babyleague_players',
  MATCHES: 'babyleague_matches',
  CURRENT_USER: 'babyleague_current_user',
  SETTINGS: 'babyleague_settings'
};

// Joueurs
export const getPlayers = () => {
  const players = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  return players ? JSON.parse(players) : [];
};

export const savePlayer = (player) => {
  const players = getPlayers();
  const existingIndex = players.findIndex(p => p.id === player.id);
  
  if (existingIndex >= 0) {
    players[existingIndex] = player;
  } else {
    players.push(player);
  }
  
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  return player;
};

export const getPlayerById = (id) => {
  const players = getPlayers();
  return players.find(p => p.id === id);
};

export const deletePlayer = (id) => {
  const players = getPlayers();
  const filtered = players.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(filtered));
};

// Matchs
export const getMatches = () => {
  const matches = localStorage.getItem(STORAGE_KEYS.MATCHES);
  return matches ? JSON.parse(matches) : [];
};

export const saveMatch = (match) => {
  const matches = getMatches();
  const existingIndex = matches.findIndex(m => m.id === match.id);
  
  if (existingIndex >= 0) {
    matches[existingIndex] = match;
  } else {
    matches.push(match);
  }
  
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return match;
};

export const getMatchById = (id) => {
  const matches = getMatches();
  return matches.find(m => m.id === id);
};

// Utilisateur actuel
export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Statistiques
export const calculatePlayerStats = (playerId, matchType = 'all') => {
  const matches = getMatches();
  const playerMatches = matches.filter(m => {
    if (m.status !== 'terminé') return false;
    if (matchType === 'officiel' && m.type !== 'officiel') return false;
    if (matchType === 'entraînement' && m.type !== 'entraînement') return false;
    
    const team1Ids = m.team1.players.map(p => p.id);
    const team2Ids = m.team2.players.map(p => p.id);
    return team1Ids.includes(playerId) || team2Ids.includes(playerId);
  });

  let victories = 0;
  let defeats = 0;
  let points = 0;

  playerMatches.forEach(match => {
    const team1Ids = match.team1.players.map(p => p.id);
    const isInTeam1 = team1Ids.includes(playerId);
    const winner = match.team1.score > match.team2.score ? 'team1' : 'team2';
    
    if ((isInTeam1 && winner === 'team1') || (!isInTeam1 && winner === 'team2')) {
      victories++;
      if (match.type === 'officiel') points += 3;
    } else {
      defeats++;
    }
  });

  const totalMatches = victories + defeats;
  const ratio = totalMatches > 0 ? (victories / totalMatches * 100).toFixed(1) : 0;

  return {
    matches: totalMatches,
    victories,
    defeats,
    points,
    ratio: parseFloat(ratio)
  };
};

// Génération d'équipes équilibrées
export const generateBalancedTeams = () => {
  const players = getPlayers();
  if (players.length < 4) return null;

  // Trier les joueurs par nombre de matchs (ascendant)
  const playersWithStats = players.map(p => ({
    ...p,
    stats: calculatePlayerStats(p.id, 'all')
  })).sort((a, b) => a.stats.matches - b.stats.matches);

  // Prendre les 4 joueurs avec le moins de matchs
  const selectedPlayers = playersWithStats.slice(0, 4);
  
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
    }
  };
};

