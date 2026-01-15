import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPlayers, savePlayer, calculatePlayerStats } from '../services/api';
import { getPlayerAvatar } from '../services/avatars';
import AlertModal from '../components/AlertModal';
import './Ranking.css';

const Ranking = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const location = useLocation();

  const loadRanking = useCallback(async () => {
    setIsLoading(true);
    try {
      const allPlayers = await getPlayers();
      const playersWithStats = await Promise.all(
        allPlayers.map(async player => {
          try {
            const stats = await calculatePlayerStats(player.id, 'officiel');
            return {
              ...player,
              stats: stats || { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 }
            };
          } catch (error) {
            console.warn(`Erreur lors du calcul des stats pour ${player.name}:`, error);
            return {
              ...player,
              stats: { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 }
            };
          }
        })
      );

      // Trier par points (décroissant), puis par ratio en cas d'égalité
      playersWithStats.sort((a, b) => {
        if (b.stats.points !== a.stats.points) {
          return b.stats.points - a.stats.points;
        }
        // Si égalité de points, trier par ratio
        if (b.stats.ratio !== a.stats.ratio) {
          return b.stats.ratio - a.stats.ratio;
        }
        // Si égalité totale, trier par nombre de matchs (plus de matchs = mieux)
        return b.stats.matches - a.stats.matches;
      });

      setPlayers(playersWithStats);
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  // Recharger le classement quand on revient sur cette page (après un match par exemple)
  useEffect(() => {
    const handleFocus = () => {
      loadRanking();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadRanking]);

  // Recharger aussi quand on navigue vers cette page
  useEffect(() => {
    if (location.pathname === '/ranking') {
      loadRanking();
    }
  }, [location.pathname, loadRanking]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Veuillez entrer un nom',
        type: 'error'
      });
      return;
    }

    setIsAdding(true);
    try {
      // Générer un email unique avec timestamp et random pour éviter les conflits
      const uniqueEmail = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@local.com`;
      
      const newPlayer = {
        name: newPlayerName.trim(),
        email: uniqueEmail
      };
      
      const createdPlayer = await savePlayer(newPlayer);
      
      if (!createdPlayer) {
        throw new Error('Aucune réponse du serveur');
      }
      
      if (!createdPlayer.id) {
        throw new Error('Le joueur n\'a pas été créé correctement (pas d\'ID retourné)');
      }
      
      setNewPlayerName('');
      await loadRanking();
      setShowAlert({
        isOpen: true,
        title: 'Succès',
        message: `Le joueur "${createdPlayer.name}" a été ajouté avec succès !`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      let errorMessage = error.message || 'Erreur inconnue lors de l\'ajout du joueur';
      
      // Message d'erreur plus clair si le serveur n'est pas disponible
      if (errorMessage.includes('backend n\'est pas disponible') || errorMessage.includes('CONNECTION_REFUSED')) {
        errorMessage = 'Le serveur backend n\'est pas démarré. Veuillez démarrer le serveur sur le port 3002.';
      }
      
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de l\'ajout du joueur: ' + errorMessage,
        type: 'error'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const exportRankingCsv = () => {
    const headers = ['Rang', 'Joueur', 'Matchs', 'Victoires', 'Défaites', 'Points', 'Ratio'];
    const rows = players.map((p, idx) => ([
      String(idx + 1),
      p.name || '',
      String(p.stats?.matches ?? 0),
      String(p.stats?.victories ?? 0),
      String(p.stats?.defeats ?? 0),
      String(p.stats?.points ?? 0),
      `${String(p.stats?.ratio ?? 0)}%`,
    ]));

    const escapeCsv = (value) => {
      const s = String(value ?? '');
      if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `babyleague-classement-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ranking">
      <h1 className="page-title">Compétition</h1>

      <div className="card">
        <h2 className="card-title">Ajouter un joueur</h2>
        <form onSubmit={handleAddPlayer} className="add-player-form">
          <div className="form-group">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nom du joueur"
              className="form-input"
              disabled={isAdding}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isAdding || !newPlayerName.trim()}
          >
            {isAdding ? 'Ajout...' : '➕ Ajouter le joueur'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Classement</h2>
          <button 
            onClick={loadRanking} 
            className="btn btn-primary"
            disabled={isLoading}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            {isLoading ? '🔄 Chargement...' : '🔄 Actualiser'}
          </button>
        </div>
        <div className="ranking-table-wrapper">
          <table className="table ranking-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Joueur</th>
                <th>Matchs</th>
                <th>Victoires</th>
                <th>Défaites</th>
                <th>Points</th>
                <th>Ratio</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Aucun joueur enregistré
                  </td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr key={player.id} className={index < 3 ? 'top-player' : ''}>
                    <td className="rank-cell" data-label="Rang">
                      <span className="rank-icon">{getRankIcon(index)}</span>
                    </td>
                    <td data-label="Joueur">
                      <div className="player-cell-content">
                        <img 
                          src={getPlayerAvatar(player)} 
                          alt={player.name}
                          className="player-avatar-small"
                        />
                        <Link to={`/profile/${player.id}`} className="player-link">
                          {player.name}
                        </Link>
                      </div>
                    </td>
                    <td data-label="Matchs">{player.stats.matches}</td>
                    <td className="victories" data-label="Victoires">{player.stats.victories}</td>
                    <td className="defeats" data-label="Défaites">{player.stats.defeats}</td>
                    <td className="points" data-label="Points">{player.stats.points}</td>
                    <td className="ratio" data-label="Ratio">{player.stats.ratio}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ranking-actions">
          <button
            onClick={exportRankingCsv}
            className="btn btn-secondary"
            disabled={players.length === 0}
            style={{ width: '100%', marginTop: '16px' }}
          >
            ⬇️ Exporter le classement (CSV)
          </button>
        </div>
      </div>

      <div className="card ranking-info">
        <h3>📊 Système de points</h3>
        <ul>
          <li>Victoire : <strong>+3 points</strong></li>
          <li>Défaite : <strong>0 point</strong></li>
        </ul>
      </div>

      <AlertModal
        isOpen={showAlert.isOpen}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, isOpen: false })}
      />
    </div>
  );
};

export default Ranking;
