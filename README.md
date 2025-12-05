# 🏓 BabyLeague

Application de gestion de matchs de babyfoot

## 🚀 Déploiement

L'application est déployée sur Vercel.

## 🛠️ Technologies

- **Frontend** : React 18
- **Backend** : Express.js
- **Base de données** : Supabase (PostgreSQL)
- **Hébergement** : Vercel

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

# Démarrer le backend (port 3001)
cd server
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

**Frontend** : Aucune variable nécessaire (utilise `/api` en production)

**Backend** (`server/.env`) :
```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
PORT=3001
```

## 📚 Documentation

- [Guide de déploiement GitHub → Vercel](DEPLOY-GITHUB-VERCEL.md)
- [Guide de migration Supabase](MIGRATION-SUPABASE.md)
- [Commandes Git rapides](PUSH-TO-GITHUB.md)

## 🎮 Fonctionnalités

- ✅ Authentification des joueurs
- ✅ Création de matchs (officiels ou entraînement)
- ✅ Scoring en temps réel
- ✅ Système de cookies (10-0)
- ✅ Système d'arbitrage avec paris
- ✅ Classements et statistiques
- ✅ Historique des matchs
- ✅ Mode sombre/clair
