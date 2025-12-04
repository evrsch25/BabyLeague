import React from 'react';
import './CookieResult.css';

const CookieResult = ({ match, onClose }) => {
  const winner = match.team1.score > match.team2.score ? match.team1 : match.team2;
  const loser = match.team1.score > match.team2.score ? match.team2 : match.team1;
  const winnerTeam = match.team1.score > match.team2.score ? 'team1' : 'team2';
  
  // Vérifier si c'est un cookie (10-0 ou moins pour les perdants)
  const isCookie = (winner.score >= 10 && loser.score <= 0);
  
  if (!isCookie) {
    return null;
  }

  const winnerNames = winner.players.map(p => p.name).join(' et ');
  const loserNames = loser.players.map(p => p.name).join(' et ');
  
  // Vérifier le pari de l'arbitre (seulement si cookie)
  let refereeResult = null;
  if (match.referee && match.bet && isCookie) {
    const betWon = match.bet === winnerTeam;
    const betTeam = match.bet === 'team1' 
      ? match.team1.players.map(p => p.name).join(' / ')
      : match.team2.players.map(p => p.name).join(' / ');
    
    if (betWon) {
      // L'arbitre a parié sur l'équipe gagnante avec cookie → il gagne un cookie
      refereeResult = {
        type: 'win',
        message: `🎯 ${match.referee.name} a parié sur ${betTeam} et gagne un cookie ! 🍪`
      };
    } else {
      // L'arbitre a parié sur l'équipe perdante avec cookie → il doit payer un cookie
      refereeResult = {
        type: 'lose',
        message: `😢 ${match.referee.name} a parié sur ${betTeam} et doit payer un cookie ! 🍪`
      };
    }
  }

  return (
    <div className="cookie-result-overlay" onClick={onClose}>
      <div className="cookie-result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cookie-result-header">
          <div className="cookie-icon">🍪</div>
          <h2 className="cookie-result-title">COOKIE !</h2>
          <button className="cookie-result-close" onClick={onClose}>×</button>
        </div>
        
        <div className="cookie-result-content">
          <div className="cookie-result-main">
            <p className="cookie-result-text">
              <strong>{loserNames}</strong> ont perdu {loser.score}-{winner.score}
            </p>
            <p className="cookie-result-action">
              🍪 Ils doivent payer un cookie à <strong>{winnerNames}</strong> 🍪
            </p>
          </div>

          {refereeResult && (
            <div className={`cookie-result-referee ${refereeResult.type}`}>
              <p>{refereeResult.message}</p>
            </div>
          )}

          {match.referee && !match.bet && (
            <div className="cookie-result-referee no-bet">
              <p>{match.referee.name} n'a pas parié</p>
            </div>
          )}
        </div>

        <div className="cookie-result-footer">
          <button onClick={onClose} className="btn btn-primary">
            Compris !
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieResult;

