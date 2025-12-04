# Guide de déploiement sur Vercel

## 📋 Prérequis

1. Un compte GitHub (gratuit)
2. Un compte Vercel (gratuit) - [vercel.com](https://vercel.com)
3. Votre projet doit être sur GitHub

## 🗄️ Étape 1 : Configurer Supabase

⚠️ **IMPORTANT** : Suivez d'abord le guide `SETUP-SUPABASE.md` pour configurer Supabase avant de déployer sur Vercel.

Une fois Supabase configuré, vous aurez votre `DATABASE_URL` à utiliser dans Vercel.

## 📝 Étape 3 : Préparer le projet

### 3.1 Créer un fichier `.vercelignore`

Créez `babyleague/.vercelignore` :

```
node_modules
.env
.env.local
*.log
.DS_Store
server/prisma/dev.db
server/prisma/dev.db-journal
```

### 3.2 Mettre à jour `vercel.json`

Le fichier existe déjà, mais vérifiez qu'il contient :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "installCommand": "npm install && cd server && npm install"
      }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 3.3 Ajouter un script de build dans `package.json`

Ajoutez dans `babyleague/package.json` :

```json
{
  "scripts": {
    "build": "react-scripts build && cd server && npm run prisma:generate"
  }
}
```

### 3.4 Mettre à jour `server/package.json`

Ajoutez un script pour les migrations en production :

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy"
  }
}
```

## 🚀 Étape 4 : Déployer sur Vercel

### Méthode 1 : Via l'interface web Vercel (Recommandé)

1. **Poussez votre code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/babyleague.git
   git push -u origin main
   ```

2. **Connectez Vercel à GitHub**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Importez votre repository GitHub
   - Sélectionnez le repository `babyleague`

3. **Configurez le projet**
   - **Framework Preset** : Create React App
   - **Root Directory** : `./babyleague` (ou laissez vide si le repo est directement dans babyleague)
   - **Build Command** : `npm run build`
   - **Output Directory** : `build`

4. **Ajoutez les variables d'environnement**
   - Cliquez sur "Environment Variables"
   - Ajoutez :
     - `DATABASE_URL` : Votre URL PostgreSQL (de Vercel Postgres ou autre)
     - `REACT_APP_API_URL` : Laissez vide (sera automatiquement `/api` en production)
     - `PORT` : `3001` (optionnel, Vercel gère le port automatiquement)

5. **Déployez**
   - Cliquez sur "Deploy"
   - Attendez la fin du build

### Méthode 2 : Via Vercel CLI

1. **Installez Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Connectez-vous**
   ```bash
   vercel login
   ```

3. **Déployez**
   ```bash
   cd babyleague
   vercel
   ```

4. **Ajoutez les variables d'environnement**
   ```bash
   vercel env add DATABASE_URL
   vercel env add REACT_APP_API_URL
   ```

5. **Déployez en production**
   ```bash
   vercel --prod
   ```

## 🔄 Étape 5 : Exécuter les migrations

Après le déploiement, vous devez exécuter les migrations Prisma :

### Option A : Via Vercel CLI
```bash
vercel env pull .env.local
cd server
npx prisma migrate deploy
```

### Option B : Via un script de build
Les migrations seront exécutées automatiquement si vous avez ajouté `vercel-build` dans `server/package.json`

## ✅ Étape 6 : Vérifier le déploiement

1. Votre application sera disponible à : `https://votre-projet.vercel.app`
2. Testez l'API : `https://votre-projet.vercel.app/api/players`
3. Vérifiez que la base de données fonctionne

## 🐛 Résolution de problèmes

### Erreur : "Prisma Client not generated"
- Ajoutez `prisma generate` dans le script `postinstall` de `server/package.json`

### Erreur : "Database connection failed"
- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que votre base de données PostgreSQL est accessible depuis Internet

### Erreur : "Module not found"
- Vérifiez que tous les `node_modules` sont installés
- Ajoutez `installCommand` dans `vercel.json`

### L'API ne fonctionne pas
- Vérifiez que `REACT_APP_API_URL` est vide ou définie sur `/api`
- Vérifiez les routes dans `vercel.json`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

