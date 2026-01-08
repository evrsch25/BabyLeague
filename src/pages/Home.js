import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, generateBalancedTeams, saveMatch } from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [nextMatch, setNextMatch] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);

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
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setNextMatch(null);
      setRecentMatches([]);
    }
  };

  const handleCreateMatch = async () => {
    // Formation automatique pour les matchs officiels
    const result = await generateBalancedTeams();
    if (!result) {
      alert('Il faut au moins 4 joueurs pour créer un match');
      return;
    }

    const newMatch = {
      type: 'officiel',
      team1: result.team1,
      team2: result.team2,
      status: 'en attente', // Le match démarre en "en attente" pour permettre le pari de l'arbitre
      startDate: new Date().toISOString(),
      goals: [],
      referee: result.referee || null,
      bet: null // Le pari sera fait avant le début du match
    };

    try {
      const savedMatch = await saveMatch(newMatch);
      navigate(`/match/${savedMatch.id}`);
    } catch (error) {
      alert('Erreur lors de la création du match: ' + error.message);
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
          <h2 className="card-title">Créer un nouveau match officiel</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Les équipes seront formées automatiquement de manière équilibrée à partir des 4 joueurs avec le moins de matchs.
          </p>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
            ⚖️ Si un 5e joueur est disponible, il sera automatiquement assigné comme arbitre et pourra parier sur une équipe pendant le match.
          </p>
          <button 
            onClick={handleCreateMatch} 
            className="btn btn-primary btn-large"
            style={{ width: '100%' }}
          >
            🏁 Créer un match
          </button>
        </div>
      )}

      {recentMatches.length > 0 && (
        <div className="card">
          <h2 className="card-title">Derniers matchs</h2>
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
        </div>
      )}
    </div>
  );
};

export default Home;

