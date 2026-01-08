# ⚽ BabyLeague

Application web de gestion de matchs de babyfoot avec système de classement et statistiques en temps réel.

## 📋 Récapitulatif des fonctionnalités validées

### ✅ 1. Authentification utilisateur

**Fichier** : `src/pages/Login.js`

L'application dispose d'un système d'authentification complet :
- **Inscription** : Création de nouveaux comptes avec nom et email
- **Connexion** : Identification via email
- **Gestion de session** : Stockage dans localStorage avec redirection automatique
- **Protection des routes** : Redirection vers la page de connexion si non authentifié

### ✅ 2. Au moins 3 fonctionnalités CRUD complètes

#### A. CRUD Players (`server/server.js`)
- **CREATE** : `POST /api/players` - Créer un nouveau joueur
- **READ** : `GET /api/players` - Liste tous les joueurs
- **READ** : `GET /api/players/:id` - Récupère un joueur spécifique
- **UPDATE** : `POST /api/players` (avec id) - Met à jour un joueur
- **DELETE** : `DELETE /api/players/:id` - Supprime un joueur

#### B. CRUD Matches (`server/server.js`)
- **CREATE** : `POST /api/matches` - Crée un nouveau match
- **READ** : `GET /api/matches` - Liste tous les matchs
- **READ** : `GET /api/matches/:id` - Récupère un match spécifique
- **UPDATE** : `POST /api/matches` (avec id) - Met à jour un match (scores, statut)

#### C. CRUD Goals (`server/server.js`)
- **CREATE** : `POST /api/matches/:id/goals` - Ajoute un but à un match
- **READ** : Les buts sont inclus dans les données des matchs

**Total : 3+ fonctionnalités CRUD complètes (Players, Matches, Goals)**

### ✅ 3. Base de données structurée avec relations

**Fichier** : `server/prisma/schema.prisma` et `server/supabase-schema.sql`

#### Modèles de données :
- **Player** : `id`, `name`, `email` (unique), `createdAt`, `updatedAt`
- **Match** : `id`, `type`, `status`, `team1Score`, `team2Score`, dates, relations joueurs
- **Goal** : `id`, `type`, `points`, `team`, `timestamp`, relations

#### Relations implémentées :
- **Player ↔ Match** : Relations multiples via clés étrangères
  - `team1Player1Matches` (Joueur 1 équipe 1)
  - `team1Player2Matches` (Joueur 2 équipe 1)
  - `team2Player1Matches` (Joueur 1 équipe 2)
  - `team2Player2Matches` (Joueur 2 équipe 2)
  - `refereeMatches` (Arbitre)
- **Match ↔ Goal** : Relation one-to-many (un match peut avoir plusieurs buts)
- **Player ↔ Goal** : Relation (chaque but est marqué par un joueur)

#### Contraintes et intégrité :
- Clés étrangères avec `onDelete: Cascade` pour la cohérence
- Index sur les colonnes critiques (status, type, matchId, playerId)
- Unicité sur l'email des joueurs
- Validation des données côté serveur

### ✅ 4. Interface responsive (mobile et desktop)

**Fichiers CSS** : Tous les composants incluent des media queries

#### Responsive design implémenté :
- **Navigation** (`src/components/Navigation.css`)
  - Menu hamburger sur mobile (< 768px)
  - Menu déroulant responsive
- **Pages principales** :
  - `src/pages/Login.css` : Media queries pour mobile/tablet
  - `src/pages/Home.css` : Grilles adaptatives (grid → colonne unique)
  - `src/pages/MatchLive.css` : Boutons de score optimisés pour tactile
  - `src/pages/Ranking.css` : Table responsive avec scroll horizontal
  - `src/pages/Profile.css` : Layout adaptatif
- **Breakpoints utilisés** :
  - `@media (max-width: 768px)` : Tablette et mobile
  - `@media (max-width: 480px)` : Mobile portrait

#### Fonctionnalités responsive :
- ✅ Menu hamburger fonctionnel
- ✅ Grilles qui s'adaptent automatiquement
- ✅ Tailles de police ajustées
- ✅ Padding et marges optimisés
- ✅ Boutons tactiles agrandis sur mobile
- ✅ Tables avec scroll horizontal si nécessaire

### ✅ 5. Au moins 1 automatisation ou workflow

#### A. Génération automatique d'équipes équilibrées
**Fichier** : `src/services/api.js` (lignes 92-128)

**Fonction** : `generateBalancedTeams()`

**Fonctionnement** :
1. Récupère tous les joueurs disponibles
2. Calcule automatiquement les statistiques de chaque joueur
3. Trie les joueurs par nombre de matchs et niveau
4. Forme automatiquement des équipes équilibrées pour garantir des matchs équitables

**Utilisation** : Déclenchée lors de la création d'un nouveau match depuis l'interface

---

#### B. Calcul automatique des statistiques
**Fichiers** : `server/server.js` (ligne 550+) et `src/services/api.js` (ligne 87)

**Fonction** : `calculatePlayerStats(playerId, matchType)`

**Fonctionnement** :
1. Récupère tous les matchs terminés du joueur
2. Calcule automatiquement :
   - Nombre de matchs joués
   - Nombre de victoires
   - Nombre de défaites
   - Points (3 pour victoire, 1 pour match nul, 0 pour défaite)
   - Ratio de victoires (%)
3. Se met à jour automatiquement après chaque match terminé

**Utilisation** : Appelée automatiquement lors de l'affichage du classement et des profils

---

#### C. Notification Discord automatique
**Fichier** : `src/services/discord.js`

**Fonction** : `sendDiscordNotification(match)`

**Fonctionnement** :
1. Déclenchée automatiquement à la fin d'un match
2. Envoie une notification sur Discord via webhook
3. Inclut automatiquement :
   - Score final du match
   - Noms des équipes et joueurs
   - Information sur le vainqueur
   - Timestamp du match

**Utilisation** : Workflow automatisé déclenché lors de la finalisation d'un match

**Configuration** : L'URL du webhook Discord peut être configurée dans localStorage

---

**Total : 3 automatisations/workflows implémentés**

---

## 🚀 Déploiement

L'application est déployée sur Vercel.

## 🛠️ Technologies

- **Frontend** : React 18 avec React Router
- **Backend** : Express.js avec Node.js
- **Base de données** : Supabase (PostgreSQL)
- **ORM/Schéma** : Prisma (schéma défini)
- **Hébergement** : Vercel (frontend)
- **Styling** : CSS avec variables CSS pour thème

## 📦 Installation locale

```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd server
npm install

# Créer le fichier .env dans server/
# Voir server/.env.example pour les variables nécessaires

# Démarrer le frontend (port 3000)
npm start

# Démarrer le backend (port 3002)
cd server
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

**Frontend** : Aucune variable nécessaire (utilise `/api` en production)

**Backend** (`server/.env`) :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
PORT=3002
```

## 🎨 Design

- **Thème** : Mode sombre permanent
- **Couleur principale** : `#091C3E` (bleu foncé)
- **Couleur secondaire** : `#CDFB0A` (vert clair/jaune)
- **Interface** : Design moderne avec animations et transitions fluides

## 📚 Documentation

- [Guide de déploiement GitHub → Vercel](DEPLOY-GITHUB-VERCEL.md)
- [Guide de migration Supabase](MIGRATION-SUPABASE.md)
- [Commandes Git rapides](PUSH-TO-GITHUB.md)

## 🎮 Fonctionnalités supplémentaires

- ✅ Création de matchs officiels uniquement
- ✅ Scoring en temps réel simplifié (+1/-1)
- ✅ Classement automatique avec tri intelligent
- ✅ Ajout de joueurs directement depuis le classement
- ✅ Profils de joueurs avec historique des matchs
- ✅ Interface intuitive et moderne
