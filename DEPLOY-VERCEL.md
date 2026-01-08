# 🚀 Guide de déploiement sur Vercel

## Prérequis

1. ✅ Un compte GitHub avec votre code poussé
2. ✅ Un compte Vercel (gratuit sur [vercel.com](https://vercel.com))
3. ✅ Votre projet Supabase actif avec les variables d'environnement

## Étapes de déploiement

### 1. Pousser votre code sur GitHub

Si vous n'avez pas encore poussé votre code :

```bash
git add .
git commit -m "Prêt pour déploiement Vercel"
git push origin main
```

### 2. Se connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"** ou **"Log In"**
3. Connectez-vous avec votre compte **GitHub**

### 3. Importer votre projet

1. Cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repository `babyleague`
3. Vercel détectera automatiquement la configuration (React + Node.js)

### 4. Configurer les variables d'environnement

⚠️ **IMPORTANT** : Avant de déployer, configurez les variables d'environnement :

Dans la section **"Environment Variables"**, ajoutez :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `SUPABASE_URL` | `https://dnbrxbemlttdmcergdty.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (votre clé complète) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `VERCEL` | `1` | Production, Preview |

💡 **Note** : Assurez-vous que votre projet Supabase est actif (pas en pause) avant de déployer.

### 5. Configurer le build

Vercel devrait détecter automatiquement la configuration grâce à `vercel.json`, mais vérifiez :

- **Framework Preset** : Other (ou détection automatique)
- **Build Command** : `npm run build`
- **Output Directory** : `build`
- **Install Command** : `npm install`

### 6. Déployer

1. Cliquez sur **"Deploy"**
2. Attendez la fin du déploiement (environ 2-3 minutes)
3. Vous obtiendrez une URL du type : `https://votre-projet.vercel.app`

### 7. Vérifier le déploiement

1. Visitez l'URL fournie par Vercel
2. Testez la connexion/inscription
3. Vérifiez que les matchs fonctionnent
4. Testez sur votre téléphone en visitant la même URL

## 📱 Utilisation sur mobile

Une fois déployé, votre application sera accessible depuis n'importe quel appareil :

1. Ouvrez votre navigateur mobile (Chrome, Safari, etc.)
2. Visitez l'URL Vercel (ex: `https://votre-projet.vercel.app`)
3. L'application est responsive et optimisée pour mobile

### Option : Installer comme PWA (Progressive Web App)

L'application peut être installée sur l'écran d'accueil de votre téléphone :

1. Sur Android : Menu → "Ajouter à l'écran d'accueil"
2. Sur iOS : Partager → "Sur l'écran d'accueil"

## 🔄 Mises à jour futures

À chaque push sur GitHub, Vercel déploiera automatiquement une nouvelle version :

```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

Vercel créera automatiquement un nouveau déploiement.

## ⚠️ Dépannage

### L'application ne se charge pas
- Vérifiez que votre projet Supabase est actif
- Vérifiez les variables d'environnement dans Vercel
- Consultez les logs de déploiement dans Vercel

### Erreur 500 sur l'API
- Vérifiez que les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont correctement configurées
- Vérifiez les logs de fonction serverless dans Vercel

### Le backend ne répond pas
- Vérifiez que `server/server.js` est bien exporté pour Vercel (déjà configuré ✅)
- Vérifiez que `vercel.json` route correctement vers `/api`

## 📊 Monitoring

- **Dashboard Vercel** : Consultez les logs, métriques et performances
- **Analytics** : Activable dans les paramètres du projet
- **Logs en temps réel** : Disponibles dans l'onglet "Functions" du dashboard

## 🔒 Sécurité

Les variables d'environnement sont sécurisées et ne sont pas exposées côté client. 
Seules les variables préfixées par `REACT_APP_` sont accessibles côté frontend.

