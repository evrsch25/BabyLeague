# 📝 Créer le fichier .env pour Supabase

## 🔧 Étapes

1. **Créez le fichier `babyleague/server/.env`** avec le contenu suivant :

```env
SUPABASE_URL=https://dnbrxbemlttdmcergdty.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYnJ4YmVtbHR0ZG1jZXJnZHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTY4NjMsImV4cCI6MjA4MDQzMjg2M30.uKvn6LOF37hpHprptaMzKtINGCIDBnTHPAmDo4JfGDY
PORT=3001
```

## 🔍 Vérifier vos valeurs Supabase

Si vous n'êtes pas sûr des valeurs :

1. **Dans Supabase Dashboard** :
   - Settings → API
   - **Project URL** : C'est votre `SUPABASE_URL` (doit commencer par `https://`)
   - **Project API keys** → `anon` `public` : C'est votre `SUPABASE_ANON_KEY`

2. **Format de SUPABASE_URL** :
   - ✅ Correct : `https://dnbrxbemlttdmcergdty.supabase.co`
   - ❌ Incorrect : `dnbrxbemlttdmcergdty.supabase.co` (manque https://)

## ⚠️ Important

- Le fichier `.env` doit être dans `babyleague/server/`
- Pas d'espaces autour du `=`
- Les guillemets sont optionnels mais recommandés
- Pas de saut de ligne dans les valeurs

