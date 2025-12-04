# Guide de déploiement sur Vercel

## ⚠️ IMPORTANT : Migration de la base de données

**SQLite ne fonctionne pas sur Vercel** car c'est un système de fichiers. Vous devez migrer vers **PostgreSQL**.

### Option 1 : Utiliser Vercel Postgres (Recommandé)

1. Créez un projet sur Vercel
2. Allez dans l'onglet "Storage" → "Create Database" → "Postgres"
3. Copiez la `DATABASE_URL` fournie

### Option 2 : Utiliser une base de données externe

- **Supabase** (gratuit) : https://supabase.com
- **Neon** (gratuit) : https://neon.tech
- **Railway** (gratuit) : https://railway.app

## 📋 Étapes de déploiement

### 1. Préparer le projet

#### A. Mettre à jour le schéma Prisma pour PostgreSQL

Modifiez `server/prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### B. Créer un fichier `.env.example` (optionnel)

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=3001
REACT_APP_API_URL="https://votre-projet.vercel.app/api"
```

### 2. Installer Vercel CLI

```bash
npm install -g vercel
```

### 3. Se connecter à Vercel

```bash
vercel login
```

### 4. Configurer le build

#### A. Créer un fichier `package.json` à la racine (si nécessaire)

Le fichier `vercel.json` est déjà configuré pour :
- Builder le frontend React
- Exposer le backend Express comme API routes

#### B. Modifier `server/server.js` pour Vercel

Le serveur doit exporter une fonction handler pour Vercel. Vérifiez que `server/server.js` exporte correctement l'app Express.

### 5. Déployer

#### Option A : Via Vercel CLI

```bash
# Depuis la racine du projet (babyleague/)
vercel

# Pour la production
vercel --prod
```

#### Option B : Via GitHub (Recommandé)

1. Créez un repository GitHub
2. Poussez votre code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/babyleague.git
   git push -u origin main
   ```

3. Allez sur https://vercel.com
4. Cliquez sur "Add New Project"
5. Importez votre repository GitHub
6. Configurez :
   - **Framework Preset** : Create React App
   - **Root Directory** : `./` (ou laissez vide)
   - **Build Command** : `cd .. && npm install && npm run build` (si nécessaire)
   - **Output Directory** : `build`

### 6. Configurer les variables d'environnement

Dans le dashboard Vercel :

1. Allez dans votre projet → **Settings** → **Environment Variables**
2. Ajoutez :
   - `DATABASE_URL` : Votre URL PostgreSQL
   - `REACT_APP_API_URL` : `https://votre-projet.vercel.app/api` (ou laissez vide pour utiliser l'URL relative)
   - `PORT` : (optionnel, Vercel gère automatiquement)

### 7. Exécuter les migrations Prisma

Après le déploiement, vous devez exécuter les migrations :

#### Option A : Via Vercel CLI

```bash
vercel env pull .env.local
cd server
npx prisma migrate deploy
```

#### Option B : Via un script de build

Ajoutez dans `server/package.json` :

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy"
  }
}
```

### 8. Vérifier le déploiement

1. Visitez votre URL Vercel : `https://votre-projet.vercel.app`
2. Vérifiez que l'API fonctionne : `https://votre-projet.vercel.app/api/players`
3. Testez la création d'un compte et d'un match

## 🔧 Configuration avancée

### Modifier `server/server.js` pour Vercel

Si nécessaire, ajoutez à la fin de `server/server.js` :

```javascript
// Export pour Vercel Serverless Functions
module.exports = app;
```

### Gérer CORS

Assurez-vous que CORS est configuré dans `server/server.js` :

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.REACT_APP_URL || '*',
  credentials: true
}));
```

## 🐛 Dépannage

### Erreur : "Cannot find module '@prisma/client'"

Ajoutez dans `server/package.json` :

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Erreur : "Database connection failed"

- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que votre base de données PostgreSQL est accessible
- Vérifiez que les migrations ont été exécutées

### Erreur : "API route not found"

- Vérifiez que `vercel.json` est correctement configuré
- Vérifiez que les routes commencent par `/api/`

## 📝 Notes importantes

1. **Base de données** : SQLite ne fonctionne pas sur Vercel, utilisez PostgreSQL
2. **Variables d'environnement** : Configurez-les dans le dashboard Vercel
3. **Migrations** : Exécutez-les après chaque déploiement si nécessaire
4. **Build** : Vercel détecte automatiquement React, mais vérifiez la configuration

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

