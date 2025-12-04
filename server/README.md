# BabyLeague Server

Backend API pour l'application BabyLeague utilisant Prisma et Express.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données :
```bash
# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et appliquer les migrations
npm run prisma:migrate
```

3. Démarrer le serveur :
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:3001`

## Structure de la base de données

### Modèles Prisma

- **Player** : Joueurs de l'application
- **Match** : Matchs de babyfoot
- **Goal** : Buts marqués dans les matchs

## API Endpoints

### Joueurs
- `GET /api/players` - Liste tous les joueurs
- `GET /api/players/:id` - Récupère un joueur
- `POST /api/players` - Crée ou met à jour un joueur
- `DELETE /api/players/:id` - Supprime un joueur
- `GET /api/players/:id/stats` - Statistiques d'un joueur

### Matchs
- `GET /api/matches` - Liste tous les matchs
- `GET /api/matches/:id` - Récupère un match
- `POST /api/matches` - Crée ou met à jour un match
- `POST /api/matches/:id/goals` - Ajoute un but à un match

## Base de données

La base de données SQLite est créée dans `prisma/dev.db` lors de la première migration.

Pour visualiser la base de données :
```bash
npm run prisma:studio
```

