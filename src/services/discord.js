// Service pour envoyer des notifications Discord

export const sendDiscordNotification = async (match) => {
  // Configuration de l'URL du webhook Discord
  // À configurer dans les paramètres de l'application
  const webhookUrl = localStorage.getItem('discord_webhook_url');
  
  if (!webhookUrl) {
    console.warn('URL du webhook Discord non configurée');
    return false;
  }

  const winner = match.team1.score > match.team2.score ? match.team1 : match.team2;
  const loser = match.team1.score > match.team2.score ? match.team2 : match.team1;
  
  const winnerNames = winner.players.map(p => p.name).join(' et ');
  const loserNames = loser.players.map(p => p.name).join(' et ');
  
  const message = {
    content: `🏁 **Match terminé** : Équipe rouge (${match.team1.score}) vs Équipe bleue (${match.team2.score})\n\nVictoire de **${winnerNames}** 🔥\nType : ${match.type === 'officiel' ? 'Officiel' : 'Entraînement'}`,
    embeds: [{
      color: match.type === 'officiel' ? 0x27ae60 : 0x3498db,
      fields: [
        {
          name: 'Équipe Rouge',
          value: match.team1.players.map(p => p.name).join(' / '),
          inline: true
        },
        {
          name: 'Équipe Bleue',
          value: match.team2.players.map(p => p.name).join(' / '),
          inline: true
        },
        {
          name: 'Score final',
          value: `${match.team1.score} - ${match.team2.score}`,
          inline: false
        }
      ],
      timestamp: new Date(match.endDate).toISOString()
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur lors de l\'envoi à Discord:', error);
    return false;
  }
};

