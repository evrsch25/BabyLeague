import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatchById, saveMatch, getCurrentUser } from '../services/api';
import { exportMatchToMake, hasMatchBeenExported, markMatchExported } from '../services/make';
import CookieResult from '../components/CookieResult';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';
import './MatchLive.css';

const MatchLive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [showCookieResult, setShowCookieResult] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingBet, setPendingBet] = useState(null); // Pari en attente de validation
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [showConfirm, setShowConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [scorePopupTeam, setScorePopupTeam] = useState(null); // 'team1' ou 'team2' ou null

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
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors du chargement du match. Vérifiez que le serveur backend est démarré.',
        type: 'error'
      });
      setTimeout(() => navigate('/'), 2000);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadMatch();
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [loadMatch]);

  const handleScoreChange = async (team, delta) => {
    if (!match || match.status !== 'en cours') return;

    const updatedMatch = { ...match };
    updatedMatch[team].score = Math.max(0, updatedMatch[team].score + delta);

    // Fermer le popup immédiatement
    setScorePopupTeam(null);

    try {
      const savedMatch = await saveMatch(updatedMatch);
      setMatch(savedMatch);

      // Vérifier si le match est terminé (10 points)
      if (savedMatch.team1.score >= 10 || savedMatch.team2.score >= 10) {
        handleMatchEnd(savedMatch);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du match:', error);
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la sauvegarde: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleTeamCardClick = (team) => {
    if (match && match.status === 'en cours') {
      setScorePopupTeam(team);
    }
  };

  const handleMatchEnd = async (finishedMatch) => {
    // S'assurer que le type est bien présent (devrait être 'officiel')
    const updatedMatch = {
      ...finishedMatch,
      type: finishedMatch.type || 'officiel', // S'assurer que le type est toujours présent
      status: 'terminé',
      endDate: new Date().toISOString()
    };

    console.log('Fin du match - Données sauvegardées:', {
      id: updatedMatch.id,
      type: updatedMatch.type,
      status: updatedMatch.status,
      team1Score: updatedMatch.team1?.score,
      team2Score: updatedMatch.team2?.score
    });

    const saved = await saveMatch(updatedMatch);

    // Automatisation Make.com → Google Sheets (export 1 seule fois par match)
    // - Non bloquant pour l'UX : on ne stoppe pas la navigation si Make échoue
    try {
      if (saved?.id && !hasMatchBeenExported(saved.id)) {
        await exportMatchToMake(saved);
        markMatchExported(saved.id);
      }
    } catch (e) {
      console.warn('Export Make (Google Sheets) échoué:', e);
    }
    
    // Vérifier si c'est un cookie (10-0 ou moins)
    const winner = finishedMatch.team1.score > finishedMatch.team2.score 
      ? finishedMatch.team1 
      : finishedMatch.team2;
    const loser = finishedMatch.team1.score > finishedMatch.team2.score 
      ? finishedMatch.team2 
      : finishedMatch.team1;
    const isCookie = winner.score >= 10 && loser.score <= 0;

    // Afficher le résultat du cookie si applicable
    if (isCookie) {
      setShowCookieResult(true);
    } else {
      // Afficher un message de fin normal
      const winnerNames = winner.players.map(p => p.name).join(' et ');
      setShowAlert({
        isOpen: true,
        title: '🏆 Match terminé !',
        message: `Victoire de ${winnerNames} !\n\nScore final: ${finishedMatch.team1.score} - ${finishedMatch.team2.score}`,
        type: 'success'
      });
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const handleCookieResultClose = () => {
    setShowCookieResult(false);
    navigate('/');
  };

  const handlePlaceBet = async () => {
    if (!match || !currentUser) return;

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
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la sauvegarde du pari: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleCancelMatch = () => {
    setShowConfirm({
      isOpen: true,
      title: 'Annuler le match',
      message: 'Êtes-vous sûr de vouloir annuler ce match ?',
      onConfirm: async () => {
        try {
          const updatedMatch = { ...match, status: 'annulé' };
          await saveMatch(updatedMatch);
          setShowConfirm({ ...showConfirm, isOpen: false });
          navigate('/');
        } catch (error) {
          console.error('Erreur lors de l\'annulation:', error);
          setShowConfirm({ ...showConfirm, isOpen: false });
          setShowAlert({
            isOpen: true,
            title: 'Erreur',
            message: 'Erreur lors de l\'annulation: ' + error.message,
            type: 'error'
          });
        }
      }
    });
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
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors du démarrage du match: ' + error.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="match-live">
      <div className="match-header">
        <h1 className="match-title">Match Officiel</h1>
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
            onClick={() => handleTeamCardClick('team1')}
          >
            <div className="team-name">Équipe Rouge</div>
            <div className="team-players">
              {match.team1.players.map(p => p.name).join(' / ')}
            </div>
            <div className="score">{match.team1.score}</div>
            {isActive && (
              <div className="team-click-hint">Appuyez pour modifier le score</div>
            )}
          </div>

          <div 
            className={`team-card team-blue ${match.team2.score >= 10 ? 'winner' : ''} ${isActive ? 'clickable' : ''}`}
            onClick={() => handleTeamCardClick('team2')}
          >
            <div className="team-name">Équipe Bleue</div>
            <div className="team-players">
              {match.team2.players.map(p => p.name).join(' / ')}
            </div>
            <div className="score">{match.team2.score}</div>
            {isActive && (
              <div className="team-click-hint">Appuyez pour modifier le score</div>
            )}
          </div>
        </div>

        {isPending && (
          <div className="match-pending">
            <h2 className="pending-title">⏳ Match en attente</h2>
            <p className="pending-text">Le match va commencer. Le pari peut être placé avant le début.</p>

            {/* Pari accessible dans tous les cas (usage mono-profil / mono-écran) */}
            {match.type === 'officiel' && (
              <div className="referee-section">
                <div className="referee-info">
                  <span className="referee-label">🎲 Pari:</span>
                  <span className="referee-name">
                    {match.bet ? (match.bet === 'team1' ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue') : 'Aucun'}
                  </span>
                </div>

                <div className="referee-bet-selection" style={{ marginTop: '20px', width: '100%' }}>
                  <label htmlFor="referee-bet-select" className="bet-select-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Choisir le pari :
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

      </div>


      {showCookieResult && match && (
        <CookieResult match={match} onClose={handleCookieResultClose} />
      )}

      <AlertModal
        isOpen={showAlert.isOpen}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, isOpen: false })}
      />

      <ConfirmModal
        isOpen={showConfirm.isOpen}
        title={showConfirm.title}
        message={showConfirm.message}
        confirmText="Confirmer"
        cancelText="Annuler"
        type="danger"
        onConfirm={() => {
          if (showConfirm.onConfirm) {
            showConfirm.onConfirm();
          }
        }}
        onCancel={() => setShowConfirm({ ...showConfirm, isOpen: false })}
      />

      {scorePopupTeam && (
        <div className="score-popup-overlay" onClick={() => setScorePopupTeam(null)}>
          <div className="score-popup" onClick={(e) => e.stopPropagation()}>
            <div className="score-popup-header">
              <h3 className="score-popup-title">
                {scorePopupTeam === 'team1' ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue'}
              </h3>
              <button 
                className="score-popup-close"
                onClick={() => setScorePopupTeam(null)}
              >
                ×
              </button>
            </div>
            <div className="score-popup-content">
              <div className="score-popup-current">
                Score actuel: <span className="score-popup-score">{match[scorePopupTeam].score}</span>
              </div>
              <div className="score-popup-buttons">
                <button
                  onClick={() => handleScoreChange(scorePopupTeam, 1)}
                  className="btn btn-success btn-large"
                >
                  +1
                </button>
                <button
                  onClick={() => handleScoreChange(scorePopupTeam, -1)}
                  className="btn btn-danger btn-large"
                  disabled={match[scorePopupTeam].score <= 0}
                >
                  -1
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchLive;

