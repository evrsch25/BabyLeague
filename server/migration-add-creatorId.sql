-- Migration : Ajouter la colonne creatorId aux tables players et matches
-- Exécutez ce script dans l'éditeur SQL de Supabase (SQL Editor)
-- Cette migration permet d'isoler les données par utilisateur

-- Ajouter la colonne creatorId à la table players
ALTER TABLE players ADD COLUMN IF NOT EXISTS "creatorId" TEXT;

-- Ajouter la colonne creatorId à la table matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS "creatorId" TEXT;

-- Ajouter la colonne avatarStyle à la table players (pour les avatars DiceBear)
ALTER TABLE players ADD COLUMN IF NOT EXISTS "avatarStyle" TEXT DEFAULT 'avataaars';

-- Créer des index pour améliorer les performances des requêtes filtrées
CREATE INDEX IF NOT EXISTS idx_players_creator_id ON players("creatorId");
CREATE INDEX IF NOT EXISTS idx_matches_creator_id ON matches("creatorId");

-- Commentaires pour documentation
COMMENT ON COLUMN players."creatorId" IS 'ID du joueur qui a créé ce joueur dans sa compétition';
COMMENT ON COLUMN matches."creatorId" IS 'ID du joueur qui a créé ce match dans sa compétition';
COMMENT ON COLUMN players."avatarStyle" IS 'Style d''avatar DiceBear choisi par le joueur';

-- Note : Les données existantes auront creatorId = NULL
-- Elles seront visibles par tous les utilisateurs jusqu'à ce qu'un creatorId leur soit assigné
