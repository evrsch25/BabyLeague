import React, { useState, useEffect, useCallback } from 'react';
import { getMatches } from '../services/api';
import './History.css';

const History = () => {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all'); // all, officiel, entraînement

  const loadMatches = useCallback(async () => {
    try {
      let allMatches = await getMatches();
    
    allMatches = allMatches.filter(m => m.status === 'terminé');
    
    if (filter !== 'all') {
      allMatches = allMatches.filter(m => m.type === filter);
    }
    
      allMatches.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
      setMatches(allMatches);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
    }
  }, [filter]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return (
    <div className="history">
      <h1 className="page-title">Historique des matchs</h1>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous
        </button>
        <button
          className={`filter-btn ${filter === 'officiel' ? 'active' : ''}`}
          onClick={() => setFilter('officiel')}
        >
          Officiels
        </button>
        <button
          className={`filter-btn ${filter === 'entraînement' ? 'active' : ''}`}
          onClick={() => setFilter('entraînement')}
        >
          Entraînements
        </button>
      </div>

      <div className="matches-list">
        {matches.length === 0 ? (
          <div className="card">
            <p className="text-center">Aucun match terminé</p>
          </div>
        ) : (
          matches.map(match => {
            const winner = match.team1.score > match.team2.score ? match.team1 : match.team2;
            
            return (
              <div key={match.id} className="card match-card">
                <div className="match-card-header">
                  <span className={`match-type-badge ${match.type === 'officiel' ? 'badge-officiel' : 'badge-entrainement'}`}>
                    {match.type === 'officiel' ? '🏆 Officiel' : '⚽ Entraînement'}
                  </span>
                  <span className="match-date">
                    {new Date(match.endDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="match-card-content">
                  <div className="match-teams">
                    <div className={`match-team ${match.team1.score > match.team2.score ? 'winner' : ''}`}>
                      <div className="match-team-label">Équipe Rouge</div>
                      <div className="match-team-players">
                        {match.team1.players.map(p => p.name).join(' / ')}
                      </div>
                      <div className="match-team-score">{match.team1.score}</div>
                    </div>

                    <div className="match-vs">VS</div>

                    <div className={`match-team ${match.team2.score > match.team1.score ? 'winner' : ''}`}>
                      <div className="match-team-label">Équipe Bleue</div>
                      <div className="match-team-players">
                        {match.team2.players.map(p => p.name).join(' / ')}
                      </div>
                      <div className="match-team-score">{match.team2.score}</div>
                    </div>
                  </div>

                  <div className="match-winner">
                    🏆 Victoire : {winner.players.map(p => p.name).join(' / ')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;

