# 🏆 BabyLeague - Gestionnaire de Compétitions de Babyfoot

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)

Application web complète de gestion de compétitions de babyfoot, permettant à chaque utilisateur de créer sa propre ligue, gérer ses joueurs, organiser des matchs et suivre les statistiques en temps réel.

---

## 📋 Table des Matières

1. [Aperçu du Projet](#-aperçu-du-projet)
2. [Technologies Utilisées](#-technologies-utilisées)
3. [Architecture du Projet](#-architecture-du-projet)
4. [Installation et Déploiement](#-installation-et-déploiement)
5. [Structure de la Base de Données](#-structure-de-la-base-de-données)
6. [Liste des Fonctionnalités](#-liste-des-fonctionnalités-implémentées)
7. [Difficultés et Solutions](#-difficultés-rencontrées-et-solutions)
8. [Améliorations Futures](#-améliorations-futures-possibles)

---

## 🎯 Aperçu du Projet

### Contexte

BabyLeague est une application web moderne qui digitalise et simplifie la gestion de compétitions de babyfoot. Chaque utilisateur peut créer son propre environnement isolé avec ses joueurs, matchs et statistiques.

### Objectifs

- Simplifier l'organisation de matchs de babyfoot
- Automatiser la formation d'équipes équilibrées
- Suivre les performances et statistiques en temps réel
- Permettre à chaque utilisateur d'avoir sa propre compétition
- Fournir une interface responsive et intuitive

---

## 🛠 Technologies Utilisées

### Frontend

| Technologie          | Version | Usage                                                           |
| -------------------- | ------- | --------------------------------------------------------------- |
| **React**            | 18.2.0  | Framework UI principal                                          |
| **React Router DOM** | 6.20.0  | Navigation SPA                                                  |
| **React Hooks**      | -       | State management (useState, useEffect, useCallback, useContext) |
| **CSS3**             | -       | Styling avec variables CSS et media queries                     |
| **LocalStorage API** | -       | Session utilisateur et préférences                              |

### Backend

| Technologie    | Version | Usage                             |
| -------------- | ------- | --------------------------------- |
| **Node.js**    | 18+     | Environnement d'exécution         |
| **Express.js** | 4.18.2  | Serveur HTTP et API REST          |
| **CORS**       | 2.8.5   | Gestion des requêtes cross-origin |
| **dotenv**     | 16.3.1  | Variables d'environnement         |

### Base de Données

| Technologie               | Version | Usage                         |
| ------------------------- | ------- | ----------------------------- |
| **Supabase**              | -       | BaaS (Backend as a Service)   |
| **PostgreSQL**            | 15+     | Base de données relationnelle |
| **@supabase/supabase-js** | 2.86.2  | Client JavaScript Supabase    |

### API Externe

| API                      | Usage                                                         |
| ------------------------ | ------------------------------------------------------------- |
| **DiceBear Avatars API** | Génération d'avatars SVG personnalisés (8 styles disponibles) |

### Automatisation (No-Code)

| Outil / API            | Usage                                            |
| ---------------------- | ------------------------------------------------ |
| **Make.com (Webhook)** | Déclenchement d'un scénario d'export des matchs  |
| **Google Sheets**      | Stockage des exports (1 ligne par match terminé) |

### Déploiement

- **Vercel** : Hébergement frontend + backend serverless
- **Supabase Cloud** : Hébergement base de données PostgreSQL

---

## 🏗 Architecture du Projet

### Structure des Dossiers

```
babyleague/
├── public/                      # Fichiers statiques
│   ├── index.html
│   └── favicon.ico
│
├── src/                         # Code source frontend
│   ├── components/              # Composants réutilisables
│   │   ├── Navigation.js
│   │   ├── AlertModal.js
│   │   ├── ConfirmModal.js
│   │   └── GoalModal.js
│   │
│   ├── pages/                   # Pages de l'application
│   │   ├── Login.js
│   │   ├── Home.js
│   │   ├── Ranking.js
│   │   ├── Profile.js
│   │   └── MatchLive.js
│   │
│   ├── services/                # Services et API
│   │   ├── api.js
│   │   ├── avatars.js
│   │   ├── make.js              # Webhook Make.com (export Google Sheets)
│   │   └── storage.js
│   │
│   ├── contexts/
│   │   └── ThemeContext.js
│   │
│   ├── App.js
│   ├── index.js
│   └── index.css
│
├── server/                      # Code source backend
│   ├── server.js
│   ├── supabase-schema.sql
│   ├── migration-add-creatorId.sql
│   ├── package.json
│   └── .env
│
├── package.json
├── vercel.json
└── README.md
```

### Architecture Technique

```
┌─────────────────────────────────────┐
│         FRONTEND (React)            │
│  Pages | Components | Services      │
└──────────────┬──────────────────────┘
               │
               │ HTTP REST API
               │
┌──────────────▼──────────────────────┐
│    BACKEND (Node.js + Express)      │
│  /api/players | /api/matches        │
└──────────────┬──────────────────────┘
               │
               │ Supabase Client
               │
┌──────────────▼──────────────────────┐
│  BASE DE DONNÉES (PostgreSQL)       │
│  players | matches | goals          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       API EXTERNE (DiceBear)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AUTOMATISATION (Make → Sheets)     │
└─────────────────────────────────────┘
```

---

## 🚀 Installation et Déploiement

### Prérequis

- **Node.js** : Version 18 ou supérieure
- **npm** : Version 8 ou supérieure
- **Compte Supabase** : Gratuit sur [supabase.com](https://supabase.com)
- **Compte Vercel** : (Optionnel) Pour le déploiement

### Installation en Local

#### 1. Cloner le Projet

```bash
git clone https://github.com/votre-username/babyleague.git
cd babyleague
```

#### 2. Configurer Supabase

**2.1. Créer un projet Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé API anonyme

**2.2. Exécuter le schéma SQL**

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez-collez le contenu de `server/supabase-schema.sql`
4. Cliquez sur **Run**
5. Répétez avec `server/migration-add-creatorId.sql`

> Important : sur Vercel, assurez-vous que les variables `SUPABASE_URL` / `SUPABASE_ANON_KEY`
> pointent vers **le même projet Supabase** dans lequel vous avez exécuté ces scripts.

**2.3. Créer le fichier `.env` backend**

```bash
cd server
touch .env
```

Contenu du fichier `.env` :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-anonyme
PORT=3002
```

#### 3. Installer les Dépendances

**Frontend** :

```bash
npm install
```

**Backend** :

```bash
cd server
npm install
cd ..
```

#### 4. Lancer l'Application

**En développement (2 terminaux)** :

Terminal 1 - Backend :

```bash
cd server
npm start
# Serveur lancé sur http://localhost:3002
```

Terminal 2 - Frontend :

```bash
npm start
# Application lancée sur http://localhost:3000
```

#### 5. (Optionnel) Automatisation Make → Google Sheets

L'automatisation est **optionnelle** : si elle n'est pas configurée, l'application fonctionne normalement.

- **Principe** : à chaque match **terminé**, le frontend envoie un JSON à un **webhook Make.com**, puis Make ajoute une ligne dans **Google Sheets**.
- **Configuration frontend** : créer un fichier `.env` à la racine (ou variables Vercel) avec :

```env
REACT_APP_MAKE_MATCH_EXPORT_WEBHOOK_URL=https://hook.make.com/xxxxx
```

### Dépannage (prod) : erreur “La table players n'existe pas”

Si vous voyez une erreur du type :

- `GET /api/players ... 500`
- “La table players n'existe pas dans Supabase”

Vérifiez :

- Le **projet Supabase** (URL) utilisé par Vercel (variables d'env).
- Que vous avez bien exécuté `server/supabase-schema.sql` puis `server/migration-add-creatorId.sql` dans ce projet.

Un endpoint de diagnostic est disponible :

- `GET /api/health`

**En production locale** :

```bash
npm run build
npm install -g serve
serve -s build
```

### Déploiement sur Vercel

#### 1. Préparer le Projet

`vercel.json` à la racine :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/server.js" },
    { "src": "/(.*)", "dest": "/build/$1" }
  ],
  "env": {
    "REACT_APP_API_URL": "/api"
  }
}
```

#### 2. Déployer via CLI

```bash
npm install -g vercel
vercel login
vercel

# Ajouter les variables d'environnement
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Redéployer
vercel --prod
```

---

## 💾 Structure de la Base de Données

### Schéma Complet

```sql
┌─────────────────────────────────────────────────────┐
│                    PLAYERS                          │
├─────────────────────────────────────────────────────┤
│ id              TEXT PRIMARY KEY                    │
│ name            TEXT NOT NULL                       │
│ email           TEXT UNIQUE NOT NULL                │
│ creatorId       TEXT                                │
│ avatarStyle     TEXT DEFAULT 'avataaars'           │
│ createdAt       TIMESTAMP WITH TIME ZONE           │
│ updatedAt       TIMESTAMP WITH TIME ZONE           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 1:N
                   │
┌──────────────────▼──────────────────────────────────┐
│                    MATCHES                          │
├─────────────────────────────────────────────────────┤
│ id              TEXT PRIMARY KEY                    │
│ type            TEXT NOT NULL                       │
│ status          TEXT NOT NULL                       │
│ team1Score      INTEGER DEFAULT 0                   │
│ team2Score      INTEGER DEFAULT 0                   │
│ team1Player1Id  TEXT REFERENCES players(id)        │
│ team1Player2Id  TEXT REFERENCES players(id)        │
│ team2Player1Id  TEXT REFERENCES players(id)        │
│ team2Player2Id  TEXT REFERENCES players(id)        │
│ refereeId       TEXT REFERENCES players(id)        │
│ bet             TEXT                                 │
│ creatorId       TEXT                                │
│ startDate       TIMESTAMP WITH TIME ZONE           │
│ endDate         TIMESTAMP WITH TIME ZONE           │
│ createdAt       TIMESTAMP WITH TIME ZONE           │
│ updatedAt       TIMESTAMP WITH TIME ZONE           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 1:N
                   │
┌──────────────────▼──────────────────────────────────┐
│                     GOALS                           │
├─────────────────────────────────────────────────────┤
│ id              TEXT PRIMARY KEY                    │
│ matchId         TEXT REFERENCES matches(id)        │
│ playerId        TEXT REFERENCES players(id)        │
│ type            TEXT NOT NULL                       │
│ points          INTEGER NOT NULL                    │
│ team            TEXT NOT NULL                       │
│ timestamp       TIMESTAMP WITH TIME ZONE           │
│ createdAt       TIMESTAMP WITH TIME ZONE           │
└─────────────────────────────────────────────────────┘
```

### Relations

- Un joueur peut participer à plusieurs matchs (team1Player1, team1Player2, etc.)
- Un joueur peut être arbitre de plusieurs matchs
- Un joueur peut créer plusieurs joueurs (creatorId - isolation)
- Un joueur peut créer plusieurs matchs (creatorId - isolation)
- Un match contient plusieurs buts (cascade delete)

### Index de Performance

```sql
idx_matches_status       ON matches(status)
idx_matches_type         ON matches(type)
idx_matches_creator_id   ON matches(creatorId)
idx_players_creator_id   ON players(creatorId)
idx_goals_match_id       ON goals(matchId)
idx_goals_player_id      ON goals(playerId)
```

### Triggers

```sql
-- Mise à jour automatique de updatedAt
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ⚡ Liste des Fonctionnalités Implémentées

### 1. Authentification et Gestion des Utilisateurs

- Inscription/Connexion avec nom + email
- Session persistante (LocalStorage)
- Modification du nom utilisateur
- Sélection d'avatar parmi 8 styles (DiceBear API)
- Suppression de compte avec confirmation
- Isolation des données par utilisateur (creatorId)

### 2. Gestion des Joueurs (CRUD Complet)

**Create** : Ajout de joueurs avec nom unique  
**Read** : Affichage du classement avec statistiques  
**Update** : Modification du nom et de l'avatar  
**Delete** : Suppression avec confirmation

**Statistiques automatiques** :

- Nombre de matchs joués
- Victoires / Défaites
- Points totaux (victoires × 3)
- Ratio de victoires (%)

**Classement dynamique** :

- Tri par points décroissants
- Badges pour le Top 3 (🥇🥈🥉)
- Avatars personnalisés (DiceBear)
- Mise à jour en temps réel

### 3. Gestion des Matchs (CRUD Complet)

**Create** : Création automatique avec équipes équilibrées  
**Read** : Consultation des matchs récents et en cours  
**Update** : Modification des scores en temps réel  
**Delete** : Soft delete via status

**Fonctionnalités** :

- Formation automatique d'équipes équilibrées (4 joueurs)
- Attribution automatique d'un arbitre (5ème joueur si disponible)
- États : `en attente`, `en cours`, `terminé`
- Score en temps réel avec boutons +1/-1
- Fin automatique à 10 points
- Calcul automatique des points pour le classement

### 4. Profils et Statistiques

**Profil utilisateur** :

- Avatar personnalisé (8 styles DiceBear)
- Nom et email
- Statistiques détaillées
- Historique des 10 derniers matchs
- Top 5 partenaires favoris

### 5. Avatars DiceBear (API Externe)

**8 styles disponibles** :

- Cartoon (avataaars)
- Robot (bottts)
- Aventurier (adventurer)
- Grand sourire (big-smile)
- Pixel Art (lorelei)
- Personas
- Pouce (thumbs)
- Emoji Fun (fun-emoji)

**Fonctionnalités** :

- Aperçu en temps réel
- Sélection au clic avec sauvegarde automatique
- Animations fluides
- Design responsive

### 6. Automatisations

**Automatisation 1 : Formation d'équipes équilibrées**

```
1. Récupération des joueurs de l'utilisateur
2. Tri par nombre de matchs (ascendant)
3. Sélection des 4 joueurs avec le moins de matchs
4. Si 5+ joueurs : attribution du 5ème comme arbitre
5. Répartition en 2 équipes équilibrées (victoires/ratio)
6. Création automatique du match
```

**Automatisation 2 : Calcul des statistiques**

```
1. Récupération des matchs terminés du joueur
2. Calcul automatique :
   - Nombre de matchs
   - Victoires (score > adversaire)
   - Défaites (score < adversaire)
   - Points (victoires × 3)
   - Ratio = (victoires / matchs) × 100
3. Mise à jour du classement en temps réel
```

### 7. Interface Responsive

**Design adaptatif complet** :

- **Desktop (> 768px)** : Navigation horizontale, grilles 2-4 colonnes
- **Tablet (768px - 480px)** : Navigation compacte, grilles 2-3 colonnes
- **Mobile (< 480px)** : Navigation mobile-first, popup pour les contrôles de score

### 8. Design et UX

- **Thème Dark Mode** par défaut
- **Palette de couleurs** : Primaire (#091C3E), Secondaire (#CDFB0A)
- **Modals personnalisés** : AlertModal et ConfirmModal (remplaçant alert/confirm natifs)
- **Animations CSS** : fadeIn, slideUp, popIn
- **Scrollbar personnalisée**

---

## 🐛 Difficultés Rencontrées et Solutions

### 1. Isolation des Données par Utilisateur

**Problème** : Tous les utilisateurs voyaient les mêmes joueurs et matchs.

**Solution** :

- Ajout de la colonne `creatorId` aux tables `players` et `matches`
- Filtrage automatique des requêtes par `creatorId`
- Modification du frontend pour ajouter automatiquement le `creatorId`
- Modification du backend pour filtrer par `creatorId` si fourni

```sql
-- Migration SQL
ALTER TABLE players ADD COLUMN "creatorId" TEXT;
ALTER TABLE matches ADD COLUMN "creatorId" TEXT;
CREATE INDEX idx_players_creator_id ON players("creatorId");
CREATE INDEX idx_matches_creator_id ON matches("creatorId");
```

**Résultat** : Chaque utilisateur a maintenant sa propre compétition isolée.

---

### 2. Affichage des Avatars

**Problème** : Les avatars ne s'affichaient pas, le style n'était pas sauvegardé en BDD.

**Solution** :

- Simplification de `getPlayerAvatar()` pour retourner directement l'URL (string)
- Ajout de la sauvegarde en BDD dans `savePlayerAvatarStyle()`
- Correction de l'utilisation dans les composants

```javascript
// Avant
export const getPlayerAvatar = (player) => {
  return { url: getAvatarUrl(seed, style), style: style };
};

// Après
export const getPlayerAvatar = (player) => {
  const style = player.avatarStyle || "avataaars";
  return getAvatarUrl(player.name, style);
};
```

**Résultat** : Avatars affichés correctement avec 8 styles disponibles.

---

### 3. Responsive Mobile (Contrôles de Score)

**Problème** : Boutons +1/-1 prenaient trop de place sur mobile.

**Solution** :

- Popup au clic sur la carte d'équipe
- Fermeture automatique après modification du score
- Animation slideUp

```javascript
const handleTeamClick = (team) => {
  setShowScoreControl(team);
};

const handleScoreChange = (team, delta) => {
  updateScore(team, delta);
  setShowScoreControl(null); // Fermeture auto
};
```

**Résultat** : Interface épurée avec UX tactile améliorée.

---

### 4. Erreurs de Build Vercel (Linting)

**Problème** : Variables importées mais non utilisées causaient l'échec du build.

**Solution** :

- Suppression des imports inutilisés
- Nettoyage du code après refactoring
- Vérification ESLint avant commit

```javascript
// Avant
const { theme, toggleTheme } = useContext(ThemeContext); // Non utilisés

// Après
// Import supprimé
```

**Résultat** : Build Vercel réussi sans warnings.

---

### 5. Connexion Backend (ERR_CONNECTION_REFUSED)

**Problème** : Frontend ne pouvait pas se connecter au backend.

**Solution** :

- Amélioration des messages d'erreur
- Configuration automatique dev/prod de l'URL API
- Documentation du démarrage des serveurs

```javascript
const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:3002/api");
```

**Résultat** : Messages explicites, configuration automatique.

---

### 6. Ranking Non Mis à Jour

**Problème** : Le classement affichait tous les joueurs à 0 points après un match.

**Solution** :

- Correction des requêtes Supabase (guillemets pour casse sensible)
- Ajout de rafraîchissement automatique
- Bouton de rafraîchissement manuel

```javascript
// Correction de la requête
.order('"createdAt"', { ascending: false })

// Rafraîchissement automatique
useEffect(() => {
  if (location.pathname === '/ranking') loadRanking();
}, [location]);
```

**Résultat** : Statistiques correctes en temps réel.

---

### 7. Supabase Projet en Pause

**Problème** : Erreur 521 "Web server is down" lors de l'accès à Supabase.

**Solution** :

- Détection de l'erreur spécifique (521, HTML Cloudflare)
- Message utilisateur avec lien vers le dashboard
- Code d'erreur personnalisé

```javascript
if (
  error.message.includes("521") ||
  error.message.includes("Web server is down")
) {
  return res.status(503).json({
    error: "Projet Supabase en pause. Réactivez-le sur le dashboard.",
    code: "SUPABASE_PAUSED",
  });
}
```

**Résultat** : Erreur détectée avec instructions claires.

---

## 🚀 Améliorations Futures Possibles

### Fonctionnalités Avancées

- **Tournois et Saisons** : Calendrier, phases éliminatoires, archives
- **Système de Pari Arbitre** : Bonus/pénalité selon le résultat
- **Statistiques Avancées** : Graphiques (Chart.js), comparaisons, heatmaps
- **Notifications Temps Réel** : WebSockets, notifications push

### Améliorations UX/UI

- **Animations** : Framer Motion, confettis, effets sonores
- **Personnalisation** : Thèmes multiples, couleurs d'équipes custom
- **Accessibilité** : Mode daltonien, contraste élevé, navigation clavier
- **PWA** : Installation mobile, mode hors ligne, synchronisation

### Optimisations Techniques

- **Performance** : Code splitting, lazy loading, virtual scrolling
- **Cache** : React Query, updates optimistes, prefetching
- **Backend** : GraphQL, rate limiting, pagination, compression
- **Base de Données** : Vues matérialisées, full-text search, partitionnement

### Fonctionnalités Sociales

- **Partage** : Réseaux sociaux, exportation PDF, QR Code
- **Compétitions Publiques** : Ligues ouvertes, classement global
- **Intégrations** : Slack, Discord, Google Calendar

### Sécurité

- **Authentification Avancée** : OAuth2, 2FA, Magic links
- **Gestion des Rôles** : Admin, Organisateur, Joueur, Spectateur
- **RGPD** : Consentement cookies, export données, suppression
