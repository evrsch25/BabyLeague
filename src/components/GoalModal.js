import React, { useState } from 'react';
import './GoalModal.css';

const GoalModal = ({ team, goalTypes, onClose, onSubmit }) => {
  const [selectedType, setSelectedType] = useState('normal');
  const [selectedPlayerId, setSelectedPlayerId] = useState(team.players[0]?.id || '');
  const [customPoints, setCustomPoints] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const goalType = goalTypes[selectedType];
    let basePoints = goalType.points || 1;

    // Pour le gardien, on utilise le multiplicateur sur le dernier but normal
    if (selectedType === 'gardien') {
      basePoints = 1; // Le multiplicateur sera appliqué dans MatchLive
    }

    // Pour le demi, on utilise le nombre personnalisé
    if (selectedType === 'demi') {
      onSubmit({
        type: selectedType,
        playerId: selectedPlayerId,
        basePoints: 1,
        customPoints: parseInt(customPoints) || 2
      });
      return;
    }

    onSubmit({
      type: selectedType,
      playerId: selectedPlayerId,
      basePoints
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Type de but</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type de but</label>
            <div className="goal-types">
              {Object.entries(goalTypes).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className={`goal-type-btn ${selectedType === key ? 'selected' : ''}`}
                  onClick={() => setSelectedType(key)}
                >
                  {value.label}
                  {value.points && !value.isGamelle && (
                    <span className="goal-points-hint">
                      {value.points > 0 ? '+' : ''}{value.points}pt
                    </span>
                  )}
                  {value.isGamelle && (
                    <span className="goal-points-hint">
                      -1pt (équipe adverse)
                    </span>
                  )}
                  {value.multiplier && (
                    <span className="goal-points-hint">×{value.multiplier}</span>
                  )}
                  {value.customPoints && (
                    <span className="goal-points-hint">Points personnalisés</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedType === 'demi' && (
            <div className="form-group">
              <label>Nombre de points</label>
              <input
                type="number"
                min="1"
                max="10"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="custom-points-input"
                required
              />
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Choisissez le nombre de points à attribuer
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Joueur marqueur</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              required
            >
              {team.players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            {selectedType === 'gamelle' && (
              <small style={{ color: '#e74c3c', display: 'block', marginTop: '4px' }}>
                ⚠️ Le point sera retiré de l'équipe adverse
              </small>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-danger">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;

