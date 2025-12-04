# 🔄 Migration de Prisma vers Supabase

## 📋 Étapes de migration

### Étape 1 : Créer les tables dans Supabase

1. **Dans Supabase Dashboard** :
   - Allez dans **SQL Editor** (icône SQL à gauche)
   - Cliquez sur **New query**
   - Copiez le contenu de `server/supabase-schema.sql`
   - Collez-le dans l'éditeur
   - Cliquez sur **Run** (ou Ctrl+Enter)

2. **Vérifiez que les tables sont créées** :
   - Allez dans **Table Editor** (icône de table à gauche)
   - Vous devriez voir : `players`, `matches`, `goals`

### Étape 2 : Configurer les variables d'environnement

Créez/modifiez `babyleague/server/.env` :

```env
SUPABASE_URL=https://dnbrxbemlttdmcergdty.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYnJ4YmVtbHR0ZG1jZXJnZHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTY4NjMsImV4cCI6MjA4MDQzMjg2M30.uKvn6LOF37hpHprptaMzKtINGCIDBnTHPAmDo4JfGDY
PORT=3001
```

**Pour trouver votre SUPABASE_URL** :
- Dans Supabase Dashboard → Settings → API
- Section "Project URL" → Copiez l'URL (sans le `/rest/v1/`)

**Pour trouver votre SUPABASE_ANON_KEY** :
- Dans Supabase Dashboard → Settings → API
- Section "Project API keys" → `anon` `public` → Copiez la clé

### Étape 3 : Installer les dépendances

```bash
cd babyleague/server
npm install @supabase/supabase-js
npm uninstall @prisma/client prisma
```

### Étape 4 : Tester le nouveau serveur

```bash
npm run dev
```

## ✅ Avantages de Supabase

- ✅ Pas besoin de migrations Prisma
- ✅ Interface graphique pour voir les données
- ✅ API REST automatique
- ✅ Real-time subscriptions (pour plus tard)
- ✅ Authentification intégrée (pour plus tard)
- ✅ Storage pour fichiers (pour plus tard)

## 🔧 Configuration Row Level Security (RLS)

Par défaut, Supabase active RLS. Pour permettre l'accès depuis votre backend :

1. **Dans Supabase Dashboard** :
   - Table Editor → Sélectionnez une table (ex: `players`)
   - Settings (icône d'engrenage) → RLS
   - Désactivez temporairement RLS pour le développement
   - Ou créez des politiques pour permettre l'accès

**Pour le développement**, vous pouvez désactiver RLS :
- Allez dans chaque table → Settings → RLS → Désactiver

**Pour la production**, créez des politiques appropriées.

