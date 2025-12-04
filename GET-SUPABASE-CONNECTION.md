# 🔑 Comment obtenir la connection string PostgreSQL Supabase

## ⚠️ Différence importante

- **API Key** (ce que vous avez) : Pour utiliser l'API REST de Supabase
- **Connection String PostgreSQL** : Pour Prisma et les connexions directes à la base de données

Nous avons besoin de la **Connection String PostgreSQL**.

## 📍 Méthode 1 : Via l'interface Supabase (Recommandé)

### Étape 1 : Trouver les informations de connexion

1. **Dans votre projet Supabase**
2. **Settings** (icône d'engrenage) → **Database**
3. Cherchez la section **"Connection string"** ou **"Connection info"**
4. Vous devriez voir :
   - **Host** : `db.dnbrxbemlttdmcergdty.supabase.co`
   - **Database name** : `postgres`
   - **Port** : `5432`
   - **User** : `postgres`

### Étape 2 : Obtenir le mot de passe

1. Dans **Settings** → **Database**
2. Section **"Database password"**
3. Si vous ne connaissez pas le mot de passe, cliquez sur **"Reset database password"**
4. **Copiez le nouveau mot de passe** (⚠️ vous ne pourrez plus le voir après)

### Étape 3 : Construire la connection string

Format :
```
postgresql://postgres:VOTRE_MOT_DE_PASSE@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
```

## 📍 Méthode 2 : Via l'API Supabase (Alternative)

Si vous ne trouvez pas la connection string dans l'interface, vous pouvez utiliser l'API Supabase pour obtenir les informations.

## 🔧 Créer le fichier .env

Créez `babyleague/server/.env` :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
PORT=3001
```

**Remplacez `VOTRE_MOT_DE_PASSE`** par le mot de passe que vous avez réinitialisé.

## 🔍 Votre API Key

L'API key que vous avez trouvée (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) est utile pour :
- Utiliser l'API REST de Supabase
- Authentification côté client
- Mais **PAS** pour Prisma

Pour Prisma, nous avons besoin de la connection string PostgreSQL directe.

## ⚡ Solution rapide

1. **Réinitialisez le mot de passe** dans Supabase (Settings → Database → Reset database password)
2. **Copiez le nouveau mot de passe**
3. **Créez `babyleague/server/.env`** avec :
   ```env
   DATABASE_URL="postgresql://postgres:NOUVEAU_MOT_DE_PASSE@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
   PORT=3001
   ```
4. **Testez** :
   ```bash
   cd babyleague/server
   npm run prisma:generate
   npm run prisma:migrate
   ```

## 🎯 Informations que vous avez déjà

D'après votre erreur, vous avez :
- **Host** : `db.dnbrxbemlttdmcergdty.supabase.co`
- **Database** : `postgres`
- **Port** : `5432`
- **User** : `postgres`

Il ne vous manque que le **mot de passe** !

