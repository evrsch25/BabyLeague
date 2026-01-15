const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

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

// ========== HEALTH / DEBUG ==========
// Endpoint de diagnostic (utile en prod Vercel)
// Permet de distinguer :
// - projet Supabase en pause
// - mauvaise URL/clé Supabase
// - tables manquantes (schema non exécuté)
// - RLS/permissions
app.get('/api/health', async (req, res) => {
  const publicUrl = (() => {
    try {
      return new URL(supabaseUrl).host;
    } catch {
      return 'INVALID_SUPABASE_URL';
    }
  })();

  const base = {
    ok: true,
    supabaseProject: publicUrl,
    checks: {},
  };

  try {
    const result = await supabase.from('players').select('id').limit(1);
    if (result.error) {
      base.ok = false;
      base.checks.players = {
        ok: false,
        code: result.error.code,
        message: result.error.message,
        hint: result.error.hint,
      };
      return res.status(500).json(base);
    }

    base.checks.players = { ok: true };
    return res.json(base);
  } catch (e) {
    base.ok = false;
    base.error = e?.message || String(e);
    return res.status(500).json(base);
  }
});

// Fonction utilitaire pour générer un ID (comme cuid de Prisma)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ========== PLAYERS ==========

// Récupérer tous les joueurs (avec filtre optionnel par creatorId)
app.get('/api/players', async (req, res) => {
  try {
    const { creatorId } = req.query;
    console.log('GET /api/players - Requête reçue', creatorId ? `(filtré par creatorId: ${creatorId})` : '');
    
    // Construire la requête avec ou sans filtre
    let query = supabase.from('players').select('*');
    
    if (creatorId) {
      query = query.eq('creatorId', creatorId);
    }
    
    let { data, error } = await query;
    
    if (error) {
      console.error('❌ Erreur Supabase GET /api/players:');
      console.error('Code erreur:', error.code);
      console.error('Message erreur:', error.message);
      console.error('Détails:', error.details);
      console.error('Hint:', error.hint);
      
      // Vérifier si c'est une erreur 521 (serveur down) ou HTML (Cloudflare)
      if (error.message && (error.message.includes('521') || error.message.includes('Web server is down') || error.message.includes('<!DOCTYPE html>'))) {
        return res.status(503).json({ 
          error: 'Le projet Supabase est actuellement en pause ou indisponible. Veuillez réactiver votre projet sur https://supabase.com/dashboard',
          code: 'SUPABASE_PAUSED'
        });
      }
      
      // Vérifier si c'est un problème de table
      if (error.message && (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01')) {
        return res.status(500).json({ 
          error: 'La table players n\'existe pas dans Supabase. Veuillez exécuter le schéma SQL dans Supabase.',
          details: error.message
        });
      }
      
      throw error;
    }
    
    // Si succès, on peut essayer d'ordonner (mais ce n'est pas critique)
    if (data && data.length > 0) {
      try {
        let orderedQuery = supabase
          .from('players')
          .select('*')
          .order('"createdAt"', { ascending: false });
        
        if (creatorId) {
          orderedQuery = orderedQuery.eq('creatorId', creatorId);
        }
        
        const orderedResult = await orderedQuery;
        if (!orderedResult.error && orderedResult.data) {
          data = orderedResult.data;
        }
      } catch (orderError) {
        console.warn('Impossible d\'ordonner par createdAt, utilisation des données sans ordre');
      }
    }
    
    console.log('✅ GET /api/players - Succès,', data?.length || 0, 'joueurs trouvés');
    res.json(data || []);
  } catch (error) {
    console.error('❌ Erreur GET /api/players:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      code: error.code
    });
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
    console.log('Requête POST /api/players reçue:', req.body);
    const { id, name, email } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      console.log('Erreur: nom manquant');
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    if (!email || !email.trim()) {
      console.log('Erreur: email manquant');
      return res.status(400).json({ error: 'L\'email est requis' });
    }
    
    if (id) {
      // Mise à jour
      console.log('Mise à jour du joueur:', id);
      const { data, error } = await supabase
        .from('players')
        .update({ name: name.trim(), email: email.trim().toLowerCase() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Cet e-mail est déjà utilisé' });
        }
        throw error;
      }
      console.log('Joueur mis à jour avec succès:', data);
      res.json(data);
    } else {
      // Création
      const newId = generateId();
      console.log('Création d\'un nouveau joueur avec ID:', newId);
      console.log('Données:', { id: newId, name: name.trim(), email: email.trim().toLowerCase() });
      
      const { data, error } = await supabase
        .from('players')
        .insert({ 
          id: newId, 
          name: name.trim(), 
          email: email.trim().toLowerCase() 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la création:', error);
        console.error('Code erreur:', error.code);
        console.error('Message erreur:', error.message);
        console.error('Détails erreur:', error.details);
        
        // Vérifier si c'est une erreur 521 (serveur down) ou HTML (Cloudflare)
        if (error.message && (error.message.includes('521') || error.message.includes('Web server is down') || error.message.includes('<!DOCTYPE html>'))) {
          return res.status(503).json({ 
            error: 'Le projet Supabase est actuellement en pause ou indisponible. Veuillez réactiver votre projet sur https://supabase.com/dashboard',
            code: 'SUPABASE_PAUSED'
          });
        }
        
        if (error.code === '23505') { // Violation de contrainte unique
          return res.status(400).json({ error: 'Cet e-mail est déjà utilisé' });
        }
        if (error.code === '42P01') { // Table n'existe pas
          return res.status(500).json({ error: 'La table players n\'existe pas dans la base de données' });
        }
        throw error;
      }
      console.log('Joueur créé avec succès:', data);
      res.json(data);
    }
  } catch (error) {
    console.error('Erreur serveur lors de la création/mise à jour du joueur:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const { creatorId } = req.query;
    console.log('GET /api/matches - Requête reçue', creatorId ? `(filtré par creatorId: ${creatorId})` : '');
    
    // Construire la requête avec ou sans filtre
    let query = supabase
      .from('matches')
      .select('*')
      .order('"createdAt"', { ascending: false });
    
    if (creatorId) {
      query = query.eq('creatorId', creatorId);
    }
    
    const { data: matches, error: matchesError } = await query;
    
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
    
    console.log('✅ GET /api/matches - Succès,', formattedMatches?.length || 0, 'matchs trouvés');
    res.json(formattedMatches);
  } catch (error) {
    console.error('❌ Erreur GET /api/matches:', error);
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
    
    console.log('POST /api/matches - Requête reçue:', { id, type, status, hasTeam1: !!team1, hasTeam2: !!team2 });
    
    // Vérifier si le match existe
    if (id) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();
      
      if (existingMatch) {
        console.log('Match existant trouvé:', { id: existingMatch.id, type: existingMatch.type, status: existingMatch.status });
        
        // Mise à jour - utiliser le type du body ou celui existant
        const matchType = type || existingMatch.type || 'officiel';
        const matchStatus = status || existingMatch.status;
        
        console.log('Mise à jour du match avec:', { type: matchType, status: matchStatus, team1Score: team1?.score, team2Score: team2?.score });
        
        const { data: updatedMatch, error: updateError } = await supabase
          .from('matches')
          .update({
            type: matchType,
            status: matchStatus,
            team1Score: team1?.score ?? existingMatch.team1Score,
            team2Score: team2?.score ?? existingMatch.team2Score,
            team1Player1Id: team1?.players?.[0]?.id || existingMatch.team1Player1Id,
            team1Player2Id: team1?.players?.[1]?.id || existingMatch.team1Player2Id,
            team2Player1Id: team2?.players?.[0]?.id || existingMatch.team2Player1Id,
            team2Player2Id: team2?.players?.[1]?.id || existingMatch.team2Player2Id,
            endDate: endDate ? new Date(endDate).toISOString() : (matchStatus === 'terminé' ? new Date().toISOString() : existingMatch.endDate),
            refereeId: referee?.id || existingMatch.refereeId || null,
            bet: bet !== undefined ? bet : existingMatch.bet
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Erreur lors de la mise à jour du match:', updateError);
          throw updateError;
        }
        
        console.log('✅ Match mis à jour avec succès:', { id: updatedMatch.id, type: updatedMatch.type, status: updatedMatch.status });
        
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
    const playerId = req.params.id;
    
    console.log(`GET /api/players/${playerId}/stats - matchType: ${matchType}`);
    
    // Récupérer tous les matchs terminés
    let query = supabase
      .from('matches')
      .select('*')
      .eq('status', 'terminé');
    
    if (matchType && matchType !== 'all') {
      query = query.eq('type', matchType);
    }
    
    const { data: matches, error: matchesError } = await query;
    
    if (matchesError) {
      console.error('Erreur lors de la récupération des matchs:', matchesError);
      throw matchesError;
    }
    
    console.log(`Nombre de matchs terminés trouvés: ${matches?.length || 0}`);
    
    // Filtrer les matchs où le joueur a participé
    const playerMatches = (matches || []).filter(match => {
      return match.team1Player1Id === playerId ||
             match.team1Player2Id === playerId ||
             match.team2Player1Id === playerId ||
             match.team2Player2Id === playerId;
    });
    
    console.log(`Nombre de matchs du joueur ${playerId}: ${playerMatches.length}`);
    
    let victories = 0;
    let defeats = 0;
    let points = 0;
    
    playerMatches.forEach(match => {
      const isInTeam1 = match.team1Player1Id === playerId || match.team1Player2Id === playerId;
      const team1Wins = match.team1Score > match.team2Score;
      const team2Wins = match.team2Score > match.team1Score;
      
      console.log(`Match ${match.id}: type=${match.type}, score=${match.team1Score}-${match.team2Score}, joueur dans team1=${isInTeam1}`);
      
      // Le joueur gagne si son équipe a le score le plus élevé
      if ((isInTeam1 && team1Wins) || (!isInTeam1 && team2Wins)) {
        victories++;
        // Points seulement pour les matchs officiels
        if (match.type === 'officiel') {
          points += 3;
          console.log(`  -> Victoire! +3 points (total: ${points})`);
        } else {
          console.log(`  -> Victoire mais match non-officiel, pas de points`);
        }
      } else if (team1Wins || team2Wins) {
        // Il y a un gagnant, donc le joueur a perdu
        defeats++;
        console.log(`  -> Défaite`);
      }
      // Note: En cas d'égalité (score identique), on ne compte ni victoire ni défaite
    });
    
    const totalMatches = victories + defeats;
    const ratio = totalMatches > 0 ? (victories / totalMatches * 100).toFixed(1) : 0;
    
    const stats = {
      matches: totalMatches,
      victories,
      defeats,
      points,
      ratio: parseFloat(ratio)
    };
    
    console.log(`Stats finales pour joueur ${playerId}:`, stats);
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors du calcul des stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pour Vercel : exporter l'app comme handler serverless
// Pour le développement local : démarrer le serveur
if (process.env.VERCEL) {
  // En production sur Vercel, on exporte l'app
  module.exports = app;
} else {
  // En développement local, on démarre le serveur
  app.listen(PORT, () => {
    console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
    console.log(`📊 Utilisation de Supabase: ${supabaseUrl}`);
  });
}
