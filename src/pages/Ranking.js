import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlayers, calculatePlayerStats } from '../services/api';
import './Ranking.css';

const Ranking = () => {
  const [players, setPlayers] = useState([]);
  const [rankingType, setRankingType] = useState('officiel'); // officiel, entraînement

  useEffect(() => {
    loadRanking();
  }, [rankingType]);

  const loadRanking = async () => {
    try {
      const allPlayers = await getPlayers();
      const playersWithStats = await Promise.all(
        allPlayers.map(async player => ({
          ...player,
          stats: await calculatePlayerStats(player.id, rankingType)
        }))
      );

      // Trier par points (pour officiel) ou par ratio (pour entraînement)
      playersWithStats.sort((a, b) => {
        if (rankingType === 'officiel') {
          if (b.stats.points !== a.stats.points) {
            return b.stats.points - a.stats.points;
          }
          return b.stats.ratio - a.stats.ratio;
        } else {
          if (b.stats.ratio !== a.stats.ratio) {
            return b.stats.ratio - a.stats.ratio;
          }
          return b.stats.matches - a.stats.matches;
        }
      });

      setPlayers(playersWithStats);
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="ranking">
      <h1 className="page-title">Classement</h1>

      <div className="ranking-tabs">
        <button
          className={`tab-btn ${rankingType === 'officiel' ? 'active' : ''}`}
          onClick={() => setRankingType('officiel')}
        >
          🏆 Classement Officiel
        </button>
        <button
          className={`tab-btn ${rankingType === 'entraînement' ? 'active' : ''}`}
          onClick={() => setRankingType('entraînement')}
        >
          ⚽ Classement Entraînement
        </button>
      </div>

      <div className="card">
        <table className="table ranking-table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Joueur</th>
              <th>Matchs</th>
              <th>Victoires</th>
              <th>Défaites</th>
              {rankingType === 'officiel' && <th>Points</th>}
              <th>Ratio</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={rankingType === 'officiel' ? 7 : 6} className="text-center">
                  Aucun match {rankingType === 'officiel' ? 'officiel' : 'd\'entraînement'} joué
                </td>
              </tr>
            ) : (
              players.map((player, index) => (
                <tr key={player.id} className={index < 3 ? 'top-player' : ''}>
                  <td className="rank-cell">
                    <span className="rank-icon">{getRankIcon(index)}</span>
                  </td>
                  <td>
                    <Link to={`/profile/${player.id}`} className="player-link">
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.stats.matches}</td>
                  <td className="victories">{player.stats.victories}</td>
                  <td className="defeats">{player.stats.defeats}</td>
                  {rankingType === 'officiel' && (
                    <td className="points">{player.stats.points}</td>
                  )}
                  <td className="ratio">{player.stats.ratio}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rankingType === 'officiel' && (
        <div className="card ranking-info">
          <h3>📊 Système de points</h3>
          <ul>
            <li>Victoire : <strong>+3 points</strong></li>
            <li>Défaite : <strong>0 point</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Ranking;

