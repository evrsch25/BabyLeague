import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayerById, getMatches, savePlayer, deletePlayer, getCurrentUser, setCurrentUser } from '../services/api';
import { getPlayerAvatar, AVATAR_STYLES, savePlayerAvatarStyle } from '../services/avatars';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('avataaars');
  const [avatarData, setAvatarData] = useState({ url: '', style: 'avataaars' });
  
  const currentUser = getCurrentUser();

  const loadProfile = useCallback(async () => {
    try {
      const playerData = await getPlayerById(id);
      if (!playerData) return;

      setPlayer(playerData);

      // Charger les matchs
      const allMatches = await getMatches();

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

  useEffect(() => {
    if (player) {
      setEditedName(player.name);
    }
  }, [player]);

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(player.name);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(player.name);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Le nom ne peut pas être vide',
        type: 'error'
      });
      return;
    }

    try {
      const updatedPlayer = await savePlayer({
        id: player.id,
        name: editedName.trim(),
        email: player.email
      });

      setPlayer(updatedPlayer);
      setIsEditingName(false);

      // Mettre à jour l'utilisateur actuel si c'est son propre profil
      if (isOwnProfile) {
        setCurrentUser(updatedPlayer);
      }

      setShowAlert({
        isOpen: true,
        title: 'Succès',
        message: 'Nom mis à jour avec succès !',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom:', error);
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour du nom: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleSaveAvatar = () => {
    if (player) {
      savePlayerAvatarStyle(player.id, selectedAvatarStyle);
      const newAvatar = getPlayerAvatar({ ...player, id: player.id });
      setAvatarData(newAvatar);
      setIsEditingAvatar(false);
      setShowAlert({
        isOpen: true,
        title: 'Succès',
        message: 'Avatar mis à jour avec succès !',
        type: 'success'
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      await deletePlayer(player.id);

      // Si c'est le profil de l'utilisateur actuel, le déconnecter
      if (isOwnProfile) {
        setCurrentUser(null);
        setShowAlert({
          isOpen: true,
          title: 'Profil supprimé',
          message: 'Votre profil a été supprimé. Vous allez être déconnecté.',
          type: 'success'
        });
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setShowAlert({
          isOpen: true,
          title: 'Profil supprimé',
          message: 'Profil supprimé avec succès.',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du profil:', error);
      setShowAlert({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la suppression du profil: ' + error.message,
        type: 'error'
      });
      setIsDeleting(false);
    }
  };

  if (!player) {
    return <div className="profile">Chargement...</div>;
  }

  const isOwnProfile = currentUser && currentUser.id === player.id;

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <img 
            src={avatarData.url} 
            alt={`Avatar de ${player.name}`} 
            className="profile-avatar"
          />
          {isOwnProfile && !isEditingAvatar && (
            <button 
              onClick={() => setIsEditingAvatar(true)} 
              className="btn-edit-avatar"
              title="Modifier l'avatar"
            >
              ✏️
            </button>
          )}
        </div>

        <div className="profile-name-container">
          {isEditingName ? (
            <div className="profile-edit-name">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="profile-name-input"
                autoFocus
              />
              <div className="profile-edit-actions">
                <button onClick={handleSaveName} className="btn btn-success btn-small">
                  ✅ Enregistrer
                </button>
                <button onClick={handleCancelEdit} className="btn btn-secondary btn-small">
                  ❌ Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="page-title">{player.name}</h1>
              {isOwnProfile && (
                <button onClick={handleEditName} className="btn-edit-name" title="Modifier le nom">
                  ✏️ Modifier
                </button>
              )}
            </>
          )}
        </div>
        {player.email && <div className="profile-email">{player.email}</div>}
        
        {isEditingAvatar && isOwnProfile && (
          <div className="avatar-selector">
            <h3>Choisir un style d'avatar :</h3>
            <div className="avatar-styles-grid">
              {AVATAR_STYLES.map((style) => (
                <div 
                  key={style.id}
                  className={`avatar-style-option ${selectedAvatarStyle === style.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatarStyle(style.id)}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${player.name}&backgroundColor=091C3E&radius=50`}
                    alt={style.name}
                    className="avatar-preview"
                  />
                  <div className="avatar-style-name">{style.name}</div>
                </div>
              ))}
            </div>
            <div className="avatar-edit-actions">
              <button onClick={handleSaveAvatar} className="btn btn-success">
                ✅ Enregistrer
              </button>
              <button onClick={() => setIsEditingAvatar(false)} className="btn btn-secondary">
                ❌ Annuler
              </button>
            </div>
          </div>
        )}
        {isOwnProfile && (
          <div className="profile-actions">
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="btn btn-danger btn-small"
            >
              {isDeleting ? '⏳ Suppression...' : '🗑️ Supprimer mon profil'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="⚠️ Supprimer le profil"
        message={`Êtes-vous sûr de vouloir supprimer le profil de ${player.name} ? Cette action est irréversible et supprimera définitivement votre compte et toutes vos données associées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <AlertModal
        isOpen={showAlert.isOpen}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, isOpen: false })}
      />

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
                      🏆 Match Officiel
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

