# Guide de configuration Supabase

## 📋 Étape 1 : Créer un compte et un projet Supabase

1. **Créez un compte Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Cliquez sur "Start your project"
   - Connectez-vous avec GitHub (recommandé) ou créez un compte

2. **Créez un nouveau projet**
   - Cliquez sur "New Project"
   - Remplissez les informations :
     - **Name** : `babyleague` (ou le nom de votre choix)
     - **Database Password** : Créez un mot de passe fort (⚠️ **SAVEZ-LE BIEN**)
     - **Region** : Choisissez la région la plus proche (ex: `West US` ou `Europe West`)
     - **Pricing Plan** : Free (gratuit)
   - Cliquez sur "Create new project"
   - ⏳ Attendez 2-3 minutes que le projet soit créé

## 🔑 Étape 2 : Récupérer la connection string

1. **Dans votre projet Supabase**
   - Allez dans **Settings** (icône d'engrenage en bas à gauche)
   - Cliquez sur **Database**
   - Faites défiler jusqu'à **Connection string**
   - Sélectionnez **URI** dans le menu déroulant
   - Copiez la connection string qui ressemble à :
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

2. **Remplacez `[YOUR-PASSWORD]`**
   - Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 1
   - Exemple :
     ```
     postgresql://postgres:monMotDePasse123@db.xxxxx.supabase.co:5432/postgres
     ```

## 🔧 Étape 3 : Mettre à jour le schema Prisma

1. **Modifiez `server/prisma/schema.prisma`**
   - Changez le provider de `sqlite` à `postgresql` :

```prisma
datasource db {
  provider = "postgresql"  // Au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```

## 📝 Étape 4 : Configurer les variables d'environnement

### En local (pour tester)

1. **Créez/modifiez `server/.env`** :
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
   PORT=3001
   ```

   ⚠️ **Note** : Ajoutez `?pgbouncer=true&connect_timeout=15` à la fin pour une meilleure connexion avec Supabase

### Pour Vercel (plus tard)

Vous ajouterez cette variable dans les paramètres Vercel.

## 🗄️ Étape 5 : Générer le client Prisma et créer les tables

1. **Générez le client Prisma** :
   ```bash
   cd babyleague/server
   npm run prisma:generate
   ```

2. **Créez les migrations** :
   ```bash
   npm run prisma:migrate
   ```
   - Si demandé, donnez un nom à la migration : `init`

3. **Appliquez les migrations à Supabase** :
   ```bash
   npx prisma migrate deploy
   ```

## ✅ Étape 6 : Vérifier la connexion

1. **Testez la connexion** :
   ```bash
   cd babyleague/server
   npx prisma studio
   ```
   - Cela ouvrira Prisma Studio dans votre navigateur
   - Si vous voyez vos tables (Player, Match, Goal), c'est que ça fonctionne !

2. **Testez le serveur** :
   ```bash
   npm run dev
   ```
   - Le serveur devrait démarrer sans erreur
   - Testez `http://localhost:3001/api/players`

## 🚀 Étape 7 : Configurer pour Vercel

Quand vous déploierez sur Vercel :

1. **Dans Vercel Dashboard** :
   - Allez dans votre projet
   - Settings → Environment Variables
   - Ajoutez :
     - **Name** : `DATABASE_URL`
     - **Value** : Votre connection string Supabase (avec le mot de passe)
     - **Environment** : Production, Preview, Development (cochez les 3)

2. **Format pour Vercel** :
   ```
   postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
   ```

## 🔒 Sécurité : Utiliser les variables d'environnement Supabase

Supabase fournit aussi une connection string avec connection pooling (recommandé pour la production) :

1. **Dans Supabase Dashboard** :
   - Settings → Database
   - Connection string → **Connection Pooling**
   - Mode : **Transaction**
   - Copiez la connection string (elle commence par `postgresql://postgres.xxxxx`)

2. **Utilisez cette URL pour Vercel** (meilleure performance)

## 📊 Étape 8 : Vérifier les tables dans Supabase

1. **Dans Supabase Dashboard** :
   - Allez dans **Table Editor** (icône de table à gauche)
   - Vous devriez voir vos tables :
     - `players`
     - `matches`
     - `goals`

## 🐛 Résolution de problèmes

### Erreur : "password authentication failed"
- Vérifiez que vous avez bien remplacé `[YOUR-PASSWORD]` dans la connection string
- Vérifiez que le mot de passe est correct

### Erreur : "connection timeout"
- Ajoutez `?pgbouncer=true&connect_timeout=15` à la fin de votre DATABASE_URL
- Vérifiez votre connexion internet

### Erreur : "relation does not exist"
- Les migrations n'ont pas été appliquées
- Exécutez : `npx prisma migrate deploy`

### Erreur : "SSL required"
- Ajoutez `?sslmode=require` à la fin de votre DATABASE_URL :
  ```
  postgresql://...?sslmode=require
  ```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Prisma avec PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Connection Pooling Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

