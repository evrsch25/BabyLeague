# 🚀 Guide complet : GitHub → Vercel

## 📋 Prérequis

1. Un compte GitHub (gratuit) - [github.com](https://github.com)
2. Un compte Vercel (gratuit) - [vercel.com](https://vercel.com)
3. Git installé sur votre machine

## 📦 Étape 1 : Préparer le projet pour Git

### 1.1 Créer un fichier .gitignore

Créez `babyleague/.gitignore` (s'il n'existe pas) :

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma (si vous l'utilisez encore)
server/prisma/dev.db
server/prisma/dev.db-journal
server/prisma/migrations/

# Supabase
.env.local
```

### 1.2 Créer un README.md (optionnel mais recommandé)

Créez `babyleague/README.md` :

```markdown
# 🏓 BabyLeague

Application de gestion de matchs de babyfoot

## 🚀 Déploiement

L'application est déployée sur Vercel.

## 🛠️ Technologies

- React
- Express.js
- Supabase (PostgreSQL)
- Vercel
```

## 🔧 Étape 2 : Initialiser Git et pousser sur GitHub

### 2.1 Initialiser Git

```bash
cd babyleague
git init
```

### 2.2 Ajouter tous les fichiers

```bash
git add .
```

### 2.3 Créer le premier commit

```bash
git commit -m "Initial commit: BabyLeague app with Supabase"
```

### 2.4 Créer un repository sur GitHub

1. **Allez sur [github.com](https://github.com)**
2. **Cliquez sur le "+" en haut à droite** → **New repository**
3. **Remplissez** :
   - **Repository name** : `babyleague` (ou le nom de votre choix)
   - **Description** : "Application de gestion de matchs de babyfoot"
   - **Visibility** : Public ou Private (votre choix)
   - **NE COCHEZ PAS** "Initialize with README" (vous avez déjà un repo local)
4. **Cliquez sur "Create repository"**

### 2.5 Connecter votre repo local à GitHub

GitHub vous donnera des commandes. Utilisez celles-ci :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/babyleague.git
git branch -M main
git push -u origin main
```

**Remplacez `VOTRE_USERNAME`** par votre nom d'utilisateur GitHub.

## 🚀 Étape 3 : Déployer sur Vercel

### 3.1 Créer un compte Vercel

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Cliquez sur "Sign Up"**
3. **Choisissez "Continue with GitHub"** (recommandé)
4. **Autorisez Vercel à accéder à votre GitHub**

### 3.2 Importer votre projet

1. **Dans Vercel Dashboard** :
   - Cliquez sur **"Add New Project"** (ou **"Import Project"**)
   - Vous verrez la liste de vos repositories GitHub
   - **Sélectionnez `babyleague`** (ou le nom que vous avez donné)

### 3.3 Configurer le projet

1. **Framework Preset** : 
   - Sélectionnez **"Create React App"**

2. **Root Directory** :
   - Laissez vide (ou mettez `./` si le repo est directement dans babyleague)

3. **Build Command** :
   - `npm run vercel-build` (ou `npm run build` si vous n'avez pas vercel-build)

4. **Output Directory** :
   - `build`

5. **Install Command** :
   - `npm install && cd server && npm install`

### 3.4 Configurer les variables d'environnement

**IMPORTANT** : Avant de déployer, ajoutez les variables d'environnement :

1. **Dans la section "Environment Variables"** :
   - Cliquez sur **"Add"** pour chaque variable :

   **Variable 1** :
   - **Name** : `SUPABASE_URL`
   - **Value** : `https://dnbrxbemlttdmcergdty.supabase.co`
   - **Environment** : ✅ Production, ✅ Preview, ✅ Development

   **Variable 2** :
   - **Name** : `SUPABASE_ANON_KEY`
   - **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYnJ4YmVtbHR0ZG1jZXJnZHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTY4NjMsImV4cCI6MjA4MDQzMjg2M30.uKvn6LOF37hpHprptaMzKtINGCIDBnTHPAmDo4JfGDY`
   - **Environment** : ✅ Production, ✅ Preview, ✅ Development

   **Variable 3** (optionnel) :
   - **Name** : `REACT_APP_API_URL`
   - **Value** : Laissez vide (sera automatiquement `/api` en production)
   - **Environment** : ✅ Production, ✅ Preview, ✅ Development

### 3.5 Déployer

1. **Cliquez sur "Deploy"**
2. **Attendez la fin du build** (2-3 minutes)
3. **Votre site sera disponible à** : `https://votre-projet.vercel.app`

## ✅ Étape 4 : Vérifier le déploiement

### 4.1 Tester l'application

1. **Ouvrez l'URL fournie par Vercel**
2. **Testez l'application** :
   - Créez un compte
   - Créez un match
   - Vérifiez que tout fonctionne

### 4.2 Vérifier les logs

Si quelque chose ne fonctionne pas :
1. **Dans Vercel Dashboard** → Votre projet
2. **Onglet "Deployments"**
3. **Cliquez sur le dernier déploiement**
4. **Regardez les logs** pour voir les erreurs

## 🔧 Étape 5 : Créer les tables dans Supabase (si pas encore fait)

**IMPORTANT** : Les tables doivent être créées dans Supabase avant d'utiliser l'application :

1. **Dans Supabase Dashboard** :
   - SQL Editor → New query
   - Copiez le contenu de `server/supabase-schema.sql`
   - Exécutez le script

2. **Désactivez RLS** (pour le développement) :
   - Table Editor → Pour chaque table → Settings → RLS → Désactiver

## 🔄 Mises à jour futures

Chaque fois que vous poussez du code sur GitHub :

```bash
git add .
git commit -m "Description de vos changements"
git push
```

Vercel déploiera automatiquement la nouvelle version ! 🎉

## 🐛 Résolution de problèmes

### Erreur : "Build failed"
- Vérifiez les logs dans Vercel
- Assurez-vous que `package.json` contient le script `vercel-build`
- Vérifiez que toutes les dépendances sont dans `package.json`

### Erreur : "Environment variable not found"
- Vérifiez que vous avez bien ajouté `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans Vercel
- Vérifiez que les variables sont activées pour Production, Preview et Development

### L'API ne fonctionne pas
- Vérifiez que `vercel.json` est correctement configuré
- Vérifiez que les routes `/api/*` pointent vers `server/server.js`
- Testez l'API directement : `https://votre-projet.vercel.app/api/players`

### Les tables n'existent pas
- Exécutez le script SQL dans Supabase
- Vérifiez que RLS est désactivé ou que les politiques sont correctes

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [GitHub Guides](https://guides.github.com/)

