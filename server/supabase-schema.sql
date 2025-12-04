-- Schema SQL pour Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase (SQL Editor)

-- Table des joueurs
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des matchs
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'officiel' ou 'entraînement'
  status TEXT NOT NULL, -- 'en cours', 'terminé', 'annulé', 'en attente'
  "startDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "endDate" TIMESTAMP WITH TIME ZONE,
  "team1Score" INTEGER DEFAULT 0,
  "team2Score" INTEGER DEFAULT 0,
  "team1Player1Id" TEXT NOT NULL REFERENCES players(id),
  "team1Player2Id" TEXT NOT NULL REFERENCES players(id),
  "team2Player1Id" TEXT NOT NULL REFERENCES players(id),
  "team2Player2Id" TEXT NOT NULL REFERENCES players(id),
  "refereeId" TEXT REFERENCES players(id),
  bet TEXT, -- 'team1', 'team2', ou null
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des buts
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  "playerId" TEXT NOT NULL REFERENCES players(id),
  type TEXT NOT NULL, -- 'normal', 'demi', 'gardien', 'gamelle', 'pissette'
  points INTEGER NOT NULL,
  team TEXT NOT NULL, -- 'team1' ou 'team2'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_type ON matches(type);
CREATE INDEX IF NOT EXISTS idx_goals_match_id ON goals("matchId");
CREATE INDEX IF NOT EXISTS idx_goals_player_id ON goals("playerId");

-- Fonction pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updatedAt
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

