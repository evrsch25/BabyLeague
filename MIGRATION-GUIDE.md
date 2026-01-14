# 🔄 Guide de Migration - Isolation des Données par Utilisateur

## 📋 Contexte

Cette migration ajoute la fonctionnalité d'**isolation des données par utilisateur**. Chaque utilisateur aura désormais ses propres joueurs, matchs et compétitions.

---

## 🎯 Changements Apportés

### 1. **Nouvelles colonnes dans Supabase**
- `players.creatorId` : ID du joueur qui a créé ce joueur
- `matches.creatorId` : ID du joueur qui a créé ce match
- `players.avatarStyle` : Style d'avatar DiceBear

### 2. **Modifications Frontend**
- `src/services/api.js` : Ajout du filtre `creatorId` aux requêtes
- Les fonctions `getPlayers()` et `getMatches()` filtrent automatiquement par utilisateur connecté
- Les fonctions `savePlayer()` et `saveMatch()` ajoutent automatiquement le `creatorId`

### 3. **Modifications Backend**
- `server/server.js` : Support du paramètre de requête `?creatorId=xxx`
- Filtrage des joueurs et matchs par `creatorId` si fourni

---

## 🚀 Étapes d'Installation

### Étape 1 : Exécuter la migration SQL sur Supabase

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **BabyLeague**
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New Query**
5. Copiez-collez le contenu de `server/migration-add-creatorId.sql`
6. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

✅ **Résultat attendu** : "Success. No rows returned"

### Étape 2 : Vérifier les nouvelles colonnes

Exécutez cette requête pour vérifier :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'players'
  AND column_name IN ('creatorId', 'avatarStyle');
```

Vous devriez voir :

| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| creatorId   | text      | YES         |
| avatarStyle | text      | YES         |

### Étape 3 : Redémarrer le backend

```bash
cd server
npm start
```

### Étape 4 : Rebuild et redémarrer le frontend

```bash
npm run build
npm start
```

---

## 🧪 Test de la Migration

### 1. Créer un premier compte

1. Allez sur `/login`
2. Créez un compte **Joueur A**
3. Ajoutez des joueurs depuis `/ranking`
4. Créez un match depuis `/`

### 2. Créer un deuxième compte

1. Déconnectez-vous
2. Créez un compte **Joueur B**
3. Ajoutez d'autres joueurs depuis `/ranking`
4. Créez un match depuis `/`

### 3. Vérifier l'isolation

- ✅ **Joueur A** ne devrait voir que ses joueurs et matchs
- ✅ **Joueur B** ne devrait voir que ses joueurs et matchs
- ✅ Aucune interférence entre les deux comptes

---

## 🔍 Comportement des Données Existantes

### Données créées AVANT la migration

- Auront `creatorId = NULL`
- Seront **visibles par tous les utilisateurs** (compatibilité ascendante)
- Pour les assigner à un utilisateur, vous pouvez exécuter :

```sql
-- Assigner tous les joueurs existants à un utilisateur spécifique
UPDATE players
SET "creatorId" = 'ID_DE_L_UTILISATEUR'
WHERE "creatorId" IS NULL;

-- Assigner tous les matchs existants à un utilisateur spécifique
UPDATE matches
SET "creatorId" = 'ID_DE_L_UTILISATEUR'
WHERE "creatorId" IS NULL;
```

### Données créées APRÈS la migration

- Auront automatiquement le `creatorId` de l'utilisateur connecté
- Seront **isolées par utilisateur**

---

## 📊 Impact sur les Fonctionnalités

| Fonctionnalité | Avant | Après |
|----------------|-------|-------|
| **Classement** | Tous les joueurs | Joueurs de l'utilisateur |
| **Matchs** | Tous les matchs | Matchs de l'utilisateur |
| **Profil** | Tous les joueurs | Joueurs de l'utilisateur |
| **Stats** | Globales | Par utilisateur |

---

## 🐛 Dépannage

### Problème : Les joueurs/matchs ne s'affichent pas

**Solution** : Vérifiez que la migration SQL a bien été exécutée

```sql
-- Vérifier la structure de la table
\d players
\d matches
```

### Problème : Erreur "column creatorId does not exist"

**Solution** : Exécutez à nouveau le script `migration-add-creatorId.sql`

### Problème : Je vois encore les anciennes données

**Solution** : Les données avec `creatorId = NULL` sont visibles par tous. Assignez-les à un utilisateur ou supprimez-les.

```sql
-- Supprimer les anciennes données non assignées
DELETE FROM matches WHERE "creatorId" IS NULL;
DELETE FROM players WHERE "creatorId" IS NULL;
```

---

## 📝 Notes Importantes

1. **Backup avant migration** : Exportez vos données avant d'exécuter la migration
2. **Déploiement** : Déployez le frontend et le backend en même temps
3. **Compatibilité** : Les anciennes données restent accessibles (creatorId = NULL)

---

## ✅ Checklist de Déploiement

- [ ] Backup de la base de données Supabase
- [ ] Migration SQL exécutée sur Supabase
- [ ] Colonnes créées vérifiées
- [ ] Backend redémarré
- [ ] Frontend rebuild et redéployé
- [ ] Tests effectués avec 2 comptes différents
- [ ] Isolation des données confirmée

---

## 🎉 Après la Migration

Chaque utilisateur peut maintenant :
- ✅ Créer sa propre compétition
- ✅ Ajouter ses propres joueurs
- ✅ Organiser ses propres matchs
- ✅ Voir uniquement ses données
- ✅ Personnaliser ses avatars

**Vos données sont maintenant isolées par utilisateur !** 🏆⚽
