import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatchById, saveMatch, getCurrentUser } from '../services/api';
import { sendDiscordNotification } from '../services/discord';
import GoalModal from '../components/GoalModal';
import CookieResult from '../components/CookieResult';
import './MatchLive.css';

const GOAL_TYPES = {
  normal: { label: 'Normal', points: 1 },
  demi: { label: 'Demi', customPoints: true },
  gardien: { label: 'Gardien', multiplier: 2 },
  gamelle: { label: 'Gamelle', points: -1, isGamelle: true },
  pissette: { label: 'Pissette', points: -1 }
};

const MatchLive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCookieResult, setShowCookieResult] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingBet, setPendingBet] = useState(null); // Pari en attente de validation

  const loadMatch = useCallback(async () => {
    try {
      const loadedMatch = await getMatchById(id);
      if (!loadedMatch) {
        console.warn('Match non trouvé, redirection vers l\'accueil');
        navigate('/');
        return;
      }
      setMatch(loadedMatch);
      // Initialiser le pari en attente avec le pari actuel du match
      setPendingBet(loadedMatch.bet || null);
    } catch (error) {
      console.error('Erreur lors du chargement du match:', error);
      // Ne pas rediriger immédiatement, afficher un message d'erreur
      alert('Erreur lors du chargement du match. Vérifiez que le serveur backend est démarré.');
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    loadMatch();
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [loadMatch]);

  const handleGoalClick = (team) => {
    setSelectedTeam(team);
    setShowGoalModal(true);
  };

  const handleGoalSubmit = async (goalData) => {
    if (!match) return;

    const { type, playerId, basePoints, customPoints } = goalData;
    let points = customPoints !== undefined ? customPoints : basePoints;

    // Appliquer le multiplicateur pour le gardien
    if (type === 'gardien') {
      points = basePoints * 2;
    }

    // Mettre à jour le score
    const updatedMatch = { ...match };
    
    // Pour la gamelle, on retire des points à l'équipe adverse
    if (type === 'gamelle') {
      const opponentTeam = selectedTeam === 'team1' ? 'team2' : 'team1';
      updatedMatch[opponentTeam].score = updatedMatch[opponentTeam].score + points; // points est déjà -1, peut aller en négatif
    } else {
      // Pour les autres types de buts, on ajoute des points à l'équipe qui marque
      updatedMatch[selectedTeam].score = updatedMatch[selectedTeam].score + points; // peut aller en négatif
    }

    // Ajouter le but à l'historique
    updatedMatch.goals = updatedMatch.goals || [];
    updatedMatch.goals.push({
      id: Date.now().toString(),
      team: selectedTeam,
      playerId,
      type,
      points,
      timestamp: new Date().toISOString()
    });

    try {
      const savedMatch = await saveMatch(updatedMatch);
      setMatch(savedMatch);
      setShowGoalModal(false);

      // Vérifier si le match est terminé
      if (savedMatch.team1.score >= 10 || savedMatch.team2.score >= 10) {
        handleMatchEnd(savedMatch);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du match:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  };

  const handleMatchEnd = async (finishedMatch) => {
    const updatedMatch = {
      ...finishedMatch,
      status: 'terminé',
      endDate: new Date().toISOString()
    };

    await saveMatch(updatedMatch);
    
    // Vérifier si c'est un cookie (10-0 ou moins)
    const winner = finishedMatch.team1.score > finishedMatch.team2.score 
      ? finishedMatch.team1 
      : finishedMatch.team2;
    const loser = finishedMatch.team1.score > finishedMatch.team2.score 
      ? finishedMatch.team2 
      : finishedMatch.team1;
    const isCookie = winner.score >= 10 && loser.score <= 0;
    
    // Envoyer la notification Discord
    await sendDiscordNotification(updatedMatch);

    // Afficher le résultat du cookie si applicable
    if (isCookie) {
      setShowCookieResult(true);
    } else {
      // Afficher un message de fin normal
      const winnerNames = winner.players.map(p => p.name).join(' et ');
      alert(`🏆 Match terminé !\n\nVictoire de ${winnerNames} !\n\nScore final: ${finishedMatch.team1.score} - ${finishedMatch.team2.score}`);
      navigate('/');
    }
  };

  const handleCookieResultClose = () => {
    setShowCookieResult(false);
    navigate('/');
  };

  const handlePlaceBet = async () => {
    if (!match || !currentUser) return;
    
    // Vérifier que l'utilisateur est l'arbitre
    if (match.referee && match.referee.id !== currentUser.id) {
      alert('Seul l\'arbitre peut parier');
      return;
    }

    const updatedMatch = {
      ...match,
      bet: pendingBet
    };

    try {
      const savedMatch = await saveMatch(updatedMatch);
      setMatch(savedMatch);
      // Synchroniser le pari en attente avec le pari sauvegardé
      setPendingBet(savedMatch.bet || null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du pari:', error);
      alert('Erreur lors de la sauvegarde du pari: ' + error.message);
    }
  };

  const handleCancelMatch = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce match ?')) {
      try {
        const updatedMatch = { ...match, status: 'annulé' };
        await saveMatch(updatedMatch);
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Erreur lors de l\'annulation: ' + error.message);
      }
    }
  };

  if (!match) {
    return <div>Chargement...</div>;
  }

  const isFinished = match.status === 'terminé';
  const isPending = match.status === 'en attente';
  const isActive = match.status === 'en cours';

  // Debug: afficher les informations du match
  console.log('Match status:', match.status);
  console.log('Match type:', match.type);
  console.log('Match referee:', match.referee);
  console.log('Match referee ID:', match.referee?.id);
  console.log('Current user:', currentUser);
  console.log('Current user ID:', currentUser?.id);
  console.log('Is pending:', isPending);
  console.log('Is referee?', currentUser && match.referee && currentUser.id === match.referee.id);

  const handleStartMatch = async () => {
    if (!match) return;
    
    const updatedMatch = {
      ...match,
      status: 'en cours',
      startDate: new Date().toISOString()
    };

    try {
      const savedMatch = await saveMatch(updatedMatch);
      setMatch(savedMatch);
    } catch (error) {
      console.error('Erreur lors du démarrage du match:', error);
      alert('Erreur lors du démarrage du match: ' + error.message);
    }
  };

  return (
    <div className="match-live">
      <div className="match-header">
        <h1 className="match-title">
          Match {match.type === 'officiel' ? 'Officiel' : 'd\'Entraînement'}
        </h1>
        {!isFinished && (
          <button onClick={handleCancelMatch} className="btn btn-danger">
            Annuler le match
          </button>
        )}
      </div>

      <div className="match-container">
        <div className="teams-display">
          <div 
            className={`team-card team-red ${match.team1.score >= 10 ? 'winner' : ''} ${isActive ? 'clickable' : ''}`}
            onClick={() => isActive && handleGoalClick('team1')}
            style={isActive ? { cursor: 'pointer' } : {}}
          >
            <div className="team-name">Équipe Rouge</div>
            <div className="team-players">
              {match.team1.players.map(p => p.name).join(' / ')}
            </div>
            <div className="score">{match.team1.score}</div>
            {isActive && (
              <div className="team-click-hint" style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
                Cliquer pour marquer
              </div>
            )}
          </div>

          <div 
            className={`team-card team-blue ${match.team2.score >= 10 ? 'winner' : ''} ${isActive ? 'clickable' : ''}`}
            onClick={() => isActive && handleGoalClick('team2')}
            style={isActive ? { cursor: 'pointer' } : {}}
          >
            <div className="team-name">Équipe Bleue</div>
            <div className="team-players">
              {match.team2.players.map(p => p.name).join(' / ')}
            </div>
            <div className="score">{match.team2.score}</div>
            {isActive && (
              <div className="team-click-hint" style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
                Cliquer pour marquer
              </div>
            )}
          </div>
        </div>

        {isPending && (
          <div className="match-pending">
            <h2 className="pending-title">⏳ Match en attente</h2>
            <p className="pending-text">Le match va commencer. L'arbitre peut placer son pari avant le début.</p>
            
            {match.type === 'officiel' && match.referee ? (
              <div className="referee-section">
                <div className="referee-info">
                  <span className="referee-label">⚖️ Arbitre:</span>
                  <span className="referee-name">{match.referee.name}</span>
                </div>
                
                {currentUser ? (
                  <>
                    <div className="referee-bet-selection" style={{ marginTop: '20px', width: '100%' }}>
                      <label htmlFor="referee-bet-select" className="bet-select-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        Choisir le pari de l'arbitre :
                      </label>
                      <select
                        id="referee-bet-select"
                        value={(pendingBet !== null ? pendingBet : match.bet) || ''}
                        onChange={(e) => {
                          console.log('Select changed to:', e.target.value);
                          setPendingBet(e.target.value || null);
                        }}
                        className="bet-select"
                        style={{ 
                          display: 'block',
                          width: '100%',
                          maxWidth: '300px',
                          margin: '0 auto',
                          padding: '12px 20px',
                          paddingRight: '45px',
                          border: '2px solid var(--border-color)',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          minHeight: '48px'
                        }}
                      >
                        <option value="">Pas de pari</option>
                        <option value="team1">🔴 Équipe Rouge</option>
                        <option value="team2">🔵 Équipe Bleue</option>
                      </select>
                    </div>
                    <button
                      onClick={handlePlaceBet}
                      className="btn btn-primary"
                      style={{ marginTop: '12px', width: '100%' }}
                      disabled={pendingBet === (match.bet || null)}
                    >
                      ✓ Valider le pari
                    </button>
                  </>
                ) : (
                  <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Vous devez être connecté pour parier
                    </p>
                    {match.bet && (
                      <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        Pari actuel: {match.bet === 'team1' ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {!match.referee && match.type === 'officiel' && 'Aucun arbitre assigné'}
                {match.type !== 'officiel' && 'Ce match n\'est pas officiel'}
              </div>
            )}

            <button 
              onClick={handleStartMatch} 
              className="btn btn-primary btn-large"
              style={{ width: '100%', marginTop: '24px', fontSize: '18px', padding: '16px' }}
            >
              🏁 Démarrer le match
            </button>
          </div>
        )}

        {isActive && (
          <>
            {match.type === 'officiel' && match.referee && (
              <div className="referee-section">
                <div className="referee-info">
                  <span className="referee-label">⚖️ Arbitre:</span>
                  <span className="referee-name">{match.referee.name}</span>
                  {match.bet ? (
                    <span className="referee-bet">
                      Pari: {match.bet === 'team1' ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue'}
                    </span>
                  ) : (
                    <span className="referee-bet no-bet">Pas de pari</span>
                  )}
                </div>
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '10px', fontSize: '14px' }}>
              Cliquez sur une équipe pour marquer un but
            </p>
          </>
        )}

        {isFinished && (
          <div className="match-finished">
            <h2>Match terminé</h2>
            <p>
              {match.team1.score > match.team2.score
                ? `Victoire de l'équipe rouge (${match.team1.players.map(p => p.name).join(' / ')})`
                : `Victoire de l'équipe bleue (${match.team2.players.map(p => p.name).join(' / ')})`}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Retour à l'accueil
            </button>
          </div>
        )}

        {match.goals && match.goals.length > 0 && (
          <div className="goals-history">
            <h3>Historique des buts</h3>
            <ul className="goals-list">
              {match.goals.slice().reverse().map(goal => {
                const team = match[goal.team];
                const player = team.players.find(p => p.id === goal.playerId);
                const goalType = GOAL_TYPES[goal.type];
                const isGamelle = goal.type === 'gamelle';
                const opponentTeam = goal.team === 'team1' ? 'team2' : 'team1';
                
                return (
                  <li key={goal.id} className={`goal-item ${goal.team === 'team1' ? 'goal-red' : 'goal-blue'}`}>
                    <span className="goal-time">
                      {new Date(goal.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="goal-player">{player?.name || 'Inconnu'}</span>
                    <span className="goal-type">
                      {goalType?.label || goal.type}
                      {isGamelle && ` (${match[opponentTeam].players.map(p => p.name).join(' / ')})`}
                    </span>
                    <span className={`goal-points ${goal.points > 0 ? 'positive' : 'negative'}`}>
                      {goal.points > 0 ? '+' : ''}{goal.points}
                      {isGamelle && ' (adverse)'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {showGoalModal && (
        <GoalModal
          team={match[selectedTeam]}
          goalTypes={GOAL_TYPES}
          onClose={() => setShowGoalModal(false)}
          onSubmit={handleGoalSubmit}
        />
      )}


      {showCookieResult && match && (
        <CookieResult match={match} onClose={handleCookieResultClose} />
      )}
    </div>
  );
};

export default MatchLive;

