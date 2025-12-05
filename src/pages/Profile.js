import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPlayerById, getMatches, calculatePlayerStats } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState({ officiel: null, entraînement: null });
  const [recentMatches, setRecentMatches] = useState([]);
  const [partners, setPartners] = useState([]);

  const loadProfile = useCallback(async () => {
    try {
      const playerData = await getPlayerById(id);
      if (!playerData) return;

      setPlayer(playerData);

      // Charger les statistiques
      const [statsOfficiel, statsEntrainement, allMatches] = await Promise.all([
        calculatePlayerStats(id, 'officiel'),
        calculatePlayerStats(id, 'entraînement'),
        getMatches()
      ]);
      
      setStats({ officiel: statsOfficiel, entraînement: statsEntrainement });

      // Charger les matchs récents
      const playerMatches = (allMatches || [])
        .filter(m => {
          if (!m || m.status !== 'terminé') return false;
          if (!m.team1 || !m.team2 || !m.team1.players || !m.team2.players) return false;
          const team1Ids = m.team1.players.map(p => p.id);
          const team2Ids = m.team2.players.map(p => p.id);
          return team1Ids.includes(id) || team2Ids.includes(id);
        })
        .sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0))
        .slice(0, 10);

      setRecentMatches(playerMatches);

      // Calculer les partenaires
      const partnerMap = {};
      for (const match of playerMatches) {
        if (!match.team1 || !match.team2 || !match.team1.players || !match.team2.players) continue;
        
        const team1Ids = match.team1.players.map(p => p.id);
        const team2Ids = match.team2.players.map(p => p.id);
        const isInTeam1 = team1Ids.includes(id);
        
        const partnerIds = isInTeam1 
          ? team1Ids.filter(pid => pid !== id)
          : team2Ids.filter(pid => pid !== id);
        
        for (const pid of partnerIds) {
          if (!partnerMap[pid]) {
            try {
              const partner = await getPlayerById(pid);
              if (partner) {
                partnerMap[pid] = {
                  ...partner,
                  matches: 0,
                  victories: 0
                };
              }
            } catch (err) {
              console.warn(`Erreur lors du chargement du partenaire ${pid}:`, err);
            }
          }
          if (partnerMap[pid]) {
            partnerMap[pid].matches++;
            
            const winner = match.team1.score > match.team2.score ? 'team1' : 'team2';
            if ((isInTeam1 && winner === 'team1') || (!isInTeam1 && winner === 'team2')) {
              partnerMap[pid].victories++;
            }
          }
        }
      }

      const partnersList = Object.values(partnerMap)
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5);
      setPartners(partnersList);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!player) {
    return <div className="profile">Chargement...</div>;
  }

  // Valeurs par défaut pour les stats si elles ne sont pas encore chargées
  const officielStats = stats.officiel || { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 };
  const entrainementStats = stats.entraînement || { matches: 0, victories: 0, defeats: 0, points: 0, ratio: 0 };

  return (
    <div className="profile">
      <div className="profile-header">
        <h1 className="page-title">{player.name}</h1>
        <div className="profile-email">{player.email}</div>
      </div>

      <div className="profile-stats">
        <div className="card">
          <h2 className="card-title">Statistiques Officielles</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{officielStats.matches}</div>
              <div className="stat-label">Matchs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value victories">{officielStats.victories}</div>
              <div className="stat-label">Victoires</div>
            </div>
            <div className="stat-item">
              <div className="stat-value defeats">{officielStats.defeats}</div>
              <div className="stat-label">Défaites</div>
            </div>
            <div className="stat-item">
              <div className="stat-value points">{officielStats.points}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-item">
              <div className="stat-value ratio">{officielStats.ratio}%</div>
              <div className="stat-label">Ratio</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Statistiques Entraînement</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{entrainementStats.matches}</div>
              <div className="stat-label">Matchs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value victories">{entrainementStats.victories}</div>
              <div className="stat-label">Victoires</div>
            </div>
            <div className="stat-item">
              <div className="stat-value defeats">{entrainementStats.defeats}</div>
              <div className="stat-label">Défaites</div>
            </div>
            <div className="stat-item">
              <div className="stat-value ratio">{entrainementStats.ratio}%</div>
              <div className="stat-label">Ratio</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details">
        {partners.length > 0 && (
          <div className="card">
            <h2 className="card-title">Partenaires favoris</h2>
            <ul className="partners-list">
              {partners.map(partner => (
                <li key={partner.id} className="partner-item">
                  <span className="partner-name">{partner.name}</span>
                  <span className="partner-stats">
                    {partner.matches} matchs, {partner.victories} victoires
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card">
          <h2 className="card-title">Derniers matchs</h2>
          {recentMatches.length === 0 ? (
            <p>Aucun match joué</p>
          ) : (
            <ul className="profile-matches">
              {recentMatches.map(match => {
                if (!match.team1 || !match.team2 || !match.team1.players || !match.team2.players) return null;
                
                const team1Ids = match.team1.players.map(p => p.id);
                const isInTeam1 = team1Ids.includes(id);
                const myTeam = isInTeam1 ? match.team1 : match.team2;
                const opponentTeam = isInTeam1 ? match.team2 : match.team1;
                const won = (isInTeam1 && match.team1.score > match.team2.score) ||
                           (!isInTeam1 && match.team2.score > match.team1.score);

                return (
                  <li key={match.id} className={`profile-match ${won ? 'won' : 'lost'}`}>
                    <div className="profile-match-header">
                      <span className={`match-result ${won ? 'victory' : 'defeat'}`}>
                        {won ? '✅' : '❌'} {myTeam.score || 0} - {opponentTeam.score || 0}
                      </span>
                      <span className="match-date">
                        {match.endDate ? new Date(match.endDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        }) : 'Date inconnue'}
                      </span>
                    </div>
                    <div className="profile-match-teams">
                      <span className="my-team">
                        {myTeam.players?.map(p => p.name).join(' / ') || 'Équipe'}
                      </span>
                      <span className="vs">vs</span>
                      <span className="opponent-team">
                        {opponentTeam.players?.map(p => p.name).join(' / ') || 'Équipe'}
                      </span>
                    </div>
                    <div className="match-type-badge-small">
                      {match.type === 'officiel' ? '🏆' : '⚽'} {match.type || 'Match'}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

