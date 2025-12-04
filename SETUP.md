# Guide d'installation - BabyLeague avec Prisma

## Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn

## Installation complète

### 1. Backend (API Prisma)

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Le serveur API sera accessible sur `http://localhost:3001`

### 2. Frontend (React)

Dans un nouveau terminal :

```bash
# Depuis la racine du projet
npm install

# Optionnel : créer un fichier .env pour configurer l'URL de l'API
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

npm start
```

L'application React sera accessible sur `http://localhost:3000`

## Structure des fichiers

```
babyleague/
├── server/                 # Backend API
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de la base de données
│   ├── server.js           # Serveur Express
│   └── package.json
├── src/                    # Frontend React
│   ├── services/
│   │   └── api.js          # Service API (remplace storage.js)
│   └── ...
└── package.json
```

## Commandes utiles

### Backend

- `npm run dev` : Démarrer le serveur en mode développement
- `npm run prisma:studio` : Ouvrir Prisma Studio pour visualiser la base de données
- `npm run prisma:migrate` : Appliquer les migrations

### Frontend

- `npm start` : Démarrer l'application React
- `npm run build` : Créer une version de production

## Base de données

La base de données SQLite est créée automatiquement dans `server/prisma/dev.db` lors de la première migration.

Pour réinitialiser la base de données :
```bash
cd server
rm prisma/dev.db
npm run prisma:migrate
```

## Dépannage

### Le serveur API ne démarre pas

Vérifiez que :
- Le port 3001 n'est pas déjà utilisé
- Les dépendances sont installées (`npm install` dans le dossier `server`)
- Prisma est généré (`npm run prisma:generate`)

### L'application React ne peut pas se connecter à l'API

Vérifiez que :
- Le serveur API est démarré sur le port 3001
- L'URL de l'API est correcte dans `.env` (ou utilisez la valeur par défaut)
- CORS est activé sur le serveur (déjà configuré dans `server.js`)

