const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialiser Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis dans .env');
  console.error('SUPABASE_URL:', supabaseUrl ? 'défini' : 'MANQUANT');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'défini' : 'MANQUANT');
  process.exit(1);
}

// Vérifier que l'URL est valide
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ Erreur: SUPABASE_URL doit commencer par http:// ou https://');
  console.error('URL actuelle:', supabaseUrl);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Fonction utilitaire pour générer un ID (comme cuid de Prisma)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ========== PLAYERS ==========

// Récupérer tous les joueurs
app.get('/api/players', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un joueur par ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Joueur non trouvé' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer ou mettre à jour un joueur
app.post('/api/players', async (req, res) => {
  try {
    const { id, name, email } = req.body;
    
    if (id) {
      // Mise à jour
      const { data, error } = await supabase
        .from('players')
        .update({ name, email })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      // Création
      const newId = generateId();
      const { data, error } = await supabase
        .from('players')
        .insert({ id: newId, name, email })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Violation de contrainte unique
          return res.status(400).json({ error: 'Cet e-mail est déjà utilisé' });
        }
        throw error;
      }
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un joueur
app.delete('/api/players/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Joueur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MATCHES ==========

// Fonction pour formater un match
const formatMatch = (match, team1Player1, team1Player2, team2Player1, team2Player2, referee, goals) => {
  return {
    id: match.id,
    type: match.type,
    status: match.status,
    startDate: match.startDate,
    endDate: match.endDate,
    team1: {
      players: [team1Player1, team1Player2].filter(Boolean),
      score: match.team1Score
    },
    team2: {
      players: [team2Player1, team2Player2].filter(Boolean),
      score: match.team2Score
    },
    referee: referee || null,
    bet: match.bet || null,
    goals: (goals || []).map(goal => ({
      id: goal.id,
      team: goal.team,
      playerId: goal.playerId,
      type: goal.type,
      points: goal.points,
      timestamp: goal.timestamp
    }))
  };
};

// Récupérer tous les matchs
app.get('/api/matches', async (req, res) => {
  try {
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (matchesError) throw matchesError;
    
    // Récupérer les joueurs et buts pour chaque match
    const formattedMatches = await Promise.all(
      (matches || []).map(async (match) => {
        // Récupérer les joueurs
        const [team1Player1, team1Player2, team2Player1, team2Player2, referee] = await Promise.all([
          supabase.from('players').select('*').eq('id', match.team1Player1Id).single(),
          supabase.from('players').select('*').eq('id', match.team1Player2Id).single(),
          supabase.from('players').select('*').eq('id', match.team2Player1Id).single(),
          supabase.from('players').select('*').eq('id', match.team2Player2Id).single(),
          match.refereeId ? supabase.from('players').select('*').eq('id', match.refereeId).single() : Promise.resolve({ data: null })
        ]);
        
        // Récupérer les buts
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('matchId', match.id)
          .order('timestamp', { ascending: true });
        
        return formatMatch(
          match,
          team1Player1.data,
          team1Player2.data,
          team2Player1.data,
          team2Player2.data,
          referee.data,
          goals || []
        );
      })
    );
    
    res.json(formattedMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un match par ID
app.get('/api/matches/:id', async (req, res) => {
  try {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (matchError) {
      if (matchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Match non trouvé' });
      }
      throw matchError;
    }
    
    // Récupérer les joueurs
    const [team1Player1, team1Player2, team2Player1, team2Player2, referee] = await Promise.all([
      supabase.from('players').select('*').eq('id', match.team1Player1Id).single(),
      supabase.from('players').select('*').eq('id', match.team1Player2Id).single(),
      supabase.from('players').select('*').eq('id', match.team2Player1Id).single(),
      supabase.from('players').select('*').eq('id', match.team2Player2Id).single(),
      match.refereeId ? supabase.from('players').select('*').eq('id', match.refereeId).single() : Promise.resolve({ data: null })
    ]);
    
    // Récupérer les buts
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('matchId', match.id)
      .order('timestamp', { ascending: true });
    
    const formattedMatch = formatMatch(
      match,
      team1Player1.data,
      team1Player2.data,
      team2Player1.data,
      team2Player2.data,
      referee.data,
      goals || []
    );
    
    res.json(formattedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer ou mettre à jour un match
app.post('/api/matches', async (req, res) => {
  try {
    const { id, type, status, team1, team2, goals, endDate, referee, bet } = req.body;
    
    // Vérifier si le match existe
    if (id) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('id', id)
        .single();
      
      if (existingMatch) {
        // Mise à jour
        const { data: updatedMatch, error: updateError } = await supabase
          .from('matches')
          .update({
            type,
            status,
            team1Score: team1.score,
            team2Score: team2.score,
            team1Player1Id: team1.players[0].id,
            team1Player2Id: team1.players[1].id,
            team2Player1Id: team2.players[0].id,
            team2Player2Id: team2.players[1].id,
            endDate: endDate ? new Date(endDate).toISOString() : null,
            refereeId: referee?.id || null,
            bet: bet || null
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        // Mettre à jour les buts si fournis
        if (goals) {
          // Supprimer les anciens buts
          await supabase
            .from('goals')
            .delete()
            .eq('matchId', id);
          
          // Créer les nouveaux buts
          if (goals.length > 0) {
            const goalsToInsert = goals.map(goal => ({
              id: goal.id || generateId(),
              matchId: id,
              playerId: goal.playerId,
              type: goal.type,
              points: goal.points,
              team: goal.team,
              timestamp: new Date(goal.timestamp).toISOString()
            }));
            
            const { error: goalsError } = await supabase
              .from('goals')
              .insert(goalsToInsert);
            
            if (goalsError) throw goalsError;
          }
        }
        
        // Récupérer le match mis à jour avec toutes les relations
        const { data: finalMatch } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();
        
        const [team1Player1, team1Player2, team2Player1, team2Player2, refereeData] = await Promise.all([
          supabase.from('players').select('*').eq('id', finalMatch.team1Player1Id).single(),
          supabase.from('players').select('*').eq('id', finalMatch.team1Player2Id).single(),
          supabase.from('players').select('*').eq('id', finalMatch.team2Player1Id).single(),
          supabase.from('players').select('*').eq('id', finalMatch.team2Player2Id).single(),
          finalMatch.refereeId ? supabase.from('players').select('*').eq('id', finalMatch.refereeId).single() : Promise.resolve({ data: null })
        ]);
        
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('matchId', id)
          .order('timestamp', { ascending: true });
        
        const formattedMatch = formatMatch(
          finalMatch,
          team1Player1.data,
          team1Player2.data,
          team2Player1.data,
          team2Player2.data,
          refereeData.data,
          goalsData || []
        );
        
        res.json(formattedMatch);
        return;
      }
    }
    
    // Création
    const newId = id || generateId();
    const { data: newMatch, error: createError } = await supabase
      .from('matches')
      .insert({
        id: newId,
        type,
        status: status || 'en cours',
        team1Score: team1.score || 0,
        team2Score: team2.score || 0,
        team1Player1Id: team1.players[0].id,
        team1Player2Id: team1.players[1].id,
        team2Player1Id: team2.players[0].id,
        team2Player2Id: team2.players[1].id,
        refereeId: referee?.id || null,
        bet: bet || null
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Récupérer les joueurs et formater
    const [team1Player1, team1Player2, team2Player1, team2Player2, refereeData] = await Promise.all([
      supabase.from('players').select('*').eq('id', newMatch.team1Player1Id).single(),
      supabase.from('players').select('*').eq('id', newMatch.team1Player2Id).single(),
      supabase.from('players').select('*').eq('id', newMatch.team2Player1Id).single(),
      supabase.from('players').select('*').eq('id', newMatch.team2Player2Id).single(),
      newMatch.refereeId ? supabase.from('players').select('*').eq('id', newMatch.refereeId).single() : Promise.resolve({ data: null })
    ]);
    
    const formattedMatch = formatMatch(
      newMatch,
      team1Player1.data,
      team1Player2.data,
      team2Player1.data,
      team2Player2.data,
      refereeData.data,
      []
    );
    
    res.json(formattedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un but à un match
app.post('/api/matches/:id/goals', async (req, res) => {
  try {
    const { playerId, type, points, team } = req.body;
    
    const { data, error } = await supabase
      .from('goals')
      .insert({
        id: generateId(),
        matchId: req.params.id,
        playerId,
        type,
        points,
        team
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      id: data.id,
      team: data.team,
      playerId: data.playerId,
      type: data.type,
      points: data.points,
      timestamp: data.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATS ==========

// Calculer les statistiques d'un joueur
app.get('/api/players/:id/stats', async (req, res) => {
  try {
    const { matchType } = req.query; // 'all', 'officiel', 'entraînement'
    
    // Récupérer tous les matchs terminés
    let query = supabase
      .from('matches')
      .select('*')
      .eq('status', 'terminé');
    
    if (matchType && matchType !== 'all') {
      query = query.eq('type', matchType);
    }
    
    const { data: matches, error: matchesError } = await query;
    
    if (matchesError) throw matchesError;
    
    // Filtrer les matchs où le joueur a participé
    const playerMatches = (matches || []).filter(match => {
      return match.team1Player1Id === req.params.id ||
             match.team1Player2Id === req.params.id ||
             match.team2Player1Id === req.params.id ||
             match.team2Player2Id === req.params.id;
    });
    
    let victories = 0;
    let defeats = 0;
    let points = 0;
    
    playerMatches.forEach(match => {
      const isInTeam1 = match.team1Player1Id === req.params.id || match.team1Player2Id === req.params.id;
      const winner = match.team1Score > match.team2Score ? 'team1' : 'team2';
      
      if ((isInTeam1 && winner === 'team1') || (!isInTeam1 && winner === 'team2')) {
        victories++;
        if (match.type === 'officiel') points += 3;
      } else {
        defeats++;
      }
    });
    
    const totalMatches = victories + defeats;
    const ratio = totalMatches > 0 ? (victories / totalMatches * 100).toFixed(1) : 0;
    
    res.json({
      matches: totalMatches,
      victories,
      defeats,
      points,
      ratio: parseFloat(ratio)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📊 Utilisation de Supabase: ${supabaseUrl}`);
});
