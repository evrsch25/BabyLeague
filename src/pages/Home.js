import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, generateBalancedTeams, saveMatch, getPlayers, calculatePlayerStats } from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [nextMatch, setNextMatch] = useState(null);
  const [matchType, setMatchType] = useState('officiel');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentMatches, setRecentMatches] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const matches = await getMatches();
      if (!matches || !Array.isArray(matches)) {
        console.warn('Aucun match trouvé ou format invalide');
        setNextMatch(null);
        setRecentMatches([]);
        setTopPlayers([]);
        return;
      }
      
      // Chercher un match en cours ou en attente
      const activeMatch = matches.find(m => m.status === 'en cours' || m.status === 'en attente');
      setNextMatch(activeMatch || null);

      const recent = matches
        .filter(m => m.status === 'terminé')
        .sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0))
        .slice(0, 5);
      setRecentMatches(recent);

      const players = await getPlayers();
      if (!players || !Array.isArray(players)) {
        console.warn('Aucun joueur trouvé ou format invalide');
        setAvailablePlayers([]);
        setTopPlayers([]);
        return;
      }
      
      const playersWithStats = await Promise.all(
        players.map(async p => {
          try {
            const stats = await calculatePlayerStats(p.id, 'officiel');
            return {
              ...p,
              stats: stats || { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 }
            };
          } catch (err) {
            console.warn(`Erreur lors du calcul des stats pour ${p.name}:`, err);
            return {
              ...p,
              stats: { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 }
            };
          }
        })
      );
      const sorted = playersWithStats.sort((a, b) => b.stats.points - a.stats.points);
      setTopPlayers(sorted.slice(0, 5));
      
      setAvailablePlayers(players);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Initialiser avec des valeurs par défaut pour éviter un écran blanc
      setNextMatch(null);
      setRecentMatches([]);
      setTopPlayers([]);
      setAvailablePlayers([]);
    }
  };

  const handleCreateMatch = async () => {
    let teams;
    let referee = null;
    
    if (matchType === 'officiel') {
      // Formation automatique pour les matchs officiels
      const result = await generateBalancedTeams();
      if (!result) {
        alert('Il faut au moins 4 joueurs pour créer un match');
        return;
      }
      teams = {
        team1: result.team1,
        team2: result.team2
      };
      // Le 5e joueur est automatiquement assigné comme arbitre
      referee = result.referee;
    } else {
      // Sélection manuelle pour les matchs d'entraînement
      if (selectedTeam1.length !== 2 || selectedTeam2.length !== 2) {
        alert('Chaque équipe doit avoir exactement 2 joueurs');
        return;
      }
      
      // Vérifier qu'aucun joueur n'est dans les deux équipes
      const team1Ids = selectedTeam1.map(p => p.id);
      const team2Ids = selectedTeam2.map(p => p.id);
      const duplicates = team1Ids.filter(id => team2Ids.includes(id));
      if (duplicates.length > 0) {
        alert('Un joueur ne peut pas être dans les deux équipes');
        return;
      }
      
      teams = {
        team1: {
          players: selectedTeam1,
          score: 0
        },
        team2: {
          players: selectedTeam2,
          score: 0
        }
      };
    }

    const newMatch = {
      // Ne pas envoyer d'id pour une création
      type: matchType,
      team1: teams.team1,
      team2: teams.team2,
      status: 'en attente', // Le match démarre en "en attente" pour permettre le pari de l'arbitre
      startDate: new Date().toISOString(),
      goals: [],
      referee: referee || null,
      bet: null // Le pari sera fait avant le début du match
    };

    try {
      const savedMatch = await saveMatch(newMatch);
      setShowCreateModal(false);
      setSelectedTeam1([]);
      setSelectedTeam2([]);
      navigate(`/match/${savedMatch.id}`);
    } catch (error) {
      alert('Erreur lors de la création du match: ' + error.message);
    }
  };

  const handleAddPlayerToTeam = (player, teamNumber) => {
    if (teamNumber === 1) {
      if (selectedTeam1.length >= 2) {
        alert('L\'équipe rouge ne peut avoir que 2 joueurs');
        return;
      }
      if (selectedTeam1.find(p => p.id === player.id)) {
        return; // Déjà dans l'équipe
      }
      if (selectedTeam2.find(p => p.id === player.id)) {
        alert('Ce joueur est déjà dans l\'équipe bleue');
        return;
      }
      setSelectedTeam1([...selectedTeam1, player]);
    } else {
      if (selectedTeam2.length >= 2) {
        alert('L\'équipe bleue ne peut avoir que 2 joueurs');
        return;
      }
      if (selectedTeam2.find(p => p.id === player.id)) {
        return; // Déjà dans l'équipe
      }
      if (selectedTeam1.find(p => p.id === player.id)) {
        alert('Ce joueur est déjà dans l\'équipe rouge');
        return;
      }
      setSelectedTeam2([...selectedTeam2, player]);
    }
  };

  const handleRemovePlayerFromTeam = (playerId, teamNumber) => {
    if (teamNumber === 1) {
      setSelectedTeam1(selectedTeam1.filter(p => p.id !== playerId));
    } else {
      setSelectedTeam2(selectedTeam2.filter(p => p.id !== playerId));
    }
  };

  const handleContinueMatch = () => {
    if (nextMatch) {
      navigate(`/match/${nextMatch.id}`);
    }
  };

  return (
    <div className="home">
      <h1 className="page-title">Accueil</h1>

      {nextMatch ? (
        <div className="card">
          <h2 className="card-title">
            {nextMatch.status === 'en attente' ? 'Match en attente' : 'Match en cours'}
          </h2>
          <div className="match-preview">
            <div className="preview-team">
              <div className="preview-team-name">Équipe Rouge</div>
              <div className="preview-players">
                {nextMatch.team1?.players?.map(p => p.name).join(' / ') || 'Équipe en cours de formation'}
              </div>
              <div className="preview-score">{nextMatch.team1?.score || 0}</div>
            </div>
            <div className="preview-vs">VS</div>
            <div className="preview-team">
              <div className="preview-team-name">Équipe Bleue</div>
              <div className="preview-players">
                {nextMatch.team2?.players?.map(p => p.name).join(' / ') || 'Équipe en cours de formation'}
              </div>
              <div className="preview-score">{nextMatch.team2?.score || 0}</div>
            </div>
          </div>
          <button onClick={handleContinueMatch} className="btn btn-primary btn-large" style={{ width: '100%', marginTop: '20px' }}>
            Continuer le match
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title">Créer un nouveau match</h2>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary btn-large"
            style={{ width: '100%' }}
          >
            🏁 Créer un match
          </button>
        </div>
      )}

      <div className="home-grid">
        <div className="card">
          <h2 className="card-title">Top 5 Classement</h2>
          {topPlayers.length > 0 ? (
            <ol className="top-list">
              {topPlayers.map((player, index) => (
                <li key={player.id} className="top-item">
                  <span className="top-rank">{index + 1}</span>
                  <span className="top-name">{player.name}</span>
                  <span className="top-points">{player.stats.points} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>Aucun match officiel joué</p>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Derniers matchs</h2>
          {recentMatches.length > 0 ? (
            <ul className="recent-list">
              {recentMatches.map(match => {
                if (!match.team1 || !match.team2) return null;
                const winner = match.team1.score > match.team2.score ? match.team1 : match.team2;
                return (
                  <li key={match.id} className="recent-item">
                    <div className="recent-teams">
                      {match.team1.players?.map(p => p.name).join(' / ') || 'Équipe 1'} vs {match.team2.players?.map(p => p.name).join(' / ') || 'Équipe 2'}
                    </div>
                    <div className="recent-score">
                      {match.team1.score || 0} - {match.team2.score || 0}
                    </div>
                    <div className="recent-winner">
                      🏆 {winner.players?.map(p => p.name).join(' / ') || 'Gagnant'}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Aucun match terminé</p>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setSelectedTeam1([]);
          setSelectedTeam2([]);
        }}>
          <div className="modal create-match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Créer un match</h2>
              <button className="modal-close" onClick={() => {
                setShowCreateModal(false);
                  setSelectedTeam1([]);
                  setSelectedTeam2([]);
              }}>×</button>
            </div>
            <div className="form-group">
              <label>Type de match</label>
              <select 
                value={matchType} 
                onChange={(e) => {
                  setMatchType(e.target.value);
                  setSelectedTeam1([]);
                  setSelectedTeam2([]);
                }}
              >
                <option value="officiel">Match officiel</option>
                <option value="entraînement">Match d'entraînement</option>
              </select>
            </div>

            {matchType === 'officiel' ? (
              <div>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Les équipes seront formées automatiquement de manière équilibrée à partir des 4 joueurs avec le moins de matchs.
                </p>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                  ⚖️ Si un 5e joueur est disponible, il sera automatiquement assigné comme arbitre et pourra parier sur une équipe pendant le match.
                </p>
              </div>
            ) : (
              <div className="team-selection">
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Sélectionnez 2 joueurs pour chaque équipe
                </p>
                
                <div className="teams-selection-container">
                  <div className="team-selection-box team-red-box">
                    <h3 className="team-selection-title">🔴 Équipe Rouge</h3>
                    <div className="selected-players">
                      {selectedTeam1.map(player => (
                        <div key={player.id} className="selected-player">
                          <span>{player.name}</span>
                          <button 
                            type="button"
                            className="remove-player-btn"
                            onClick={() => handleRemovePlayerFromTeam(player.id, 1)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {selectedTeam1.length < 2 && (
                        <div className="player-placeholder">
                          {selectedTeam1.length === 0 ? '2 joueurs requis' : '1 joueur requis'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="team-selection-box team-blue-box">
                    <h3 className="team-selection-title">🔵 Équipe Bleue</h3>
                    <div className="selected-players">
                      {selectedTeam2.map(player => (
                        <div key={player.id} className="selected-player">
                          <span>{player.name}</span>
                          <button 
                            type="button"
                            className="remove-player-btn"
                            onClick={() => handleRemovePlayerFromTeam(player.id, 2)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {selectedTeam2.length < 2 && (
                        <div className="player-placeholder">
                          {selectedTeam2.length === 0 ? '2 joueurs requis' : '1 joueur requis'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="available-players-section">
                  <h4>Joueurs disponibles</h4>
                  <div className="available-players-list">
                    {availablePlayers.map(player => {
                      const inTeam1 = selectedTeam1.find(p => p.id === player.id);
                      const inTeam2 = selectedTeam2.find(p => p.id === player.id);
                      const isSelected = inTeam1 || inTeam2;
                      
                      return (
                        <button
                          key={player.id}
                          type="button"
                          className={`player-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (inTeam1) {
                              handleRemovePlayerFromTeam(player.id, 1);
                            } else if (inTeam2) {
                              handleRemovePlayerFromTeam(player.id, 2);
                            } else {
                              // Ajouter à l'équipe qui a le moins de joueurs
                              if (selectedTeam1.length <= selectedTeam2.length) {
                                handleAddPlayerToTeam(player, 1);
                              } else {
                                handleAddPlayerToTeam(player, 2);
                              }
                            }
                          }}
                          disabled={isSelected && selectedTeam1.length === 2 && selectedTeam2.length === 2}
                        >
                          {player.name}
                          {inTeam1 && ' (Rouge)'}
                          {inTeam2 && ' (Bleue)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleCreateMatch} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '20px' }}
              disabled={matchType === 'entraînement' && (selectedTeam1.length !== 2 || selectedTeam2.length !== 2)}
            >
              Créer le match
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

