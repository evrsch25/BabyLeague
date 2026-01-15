# 📝 Créer le fichier .env pour Supabase

## 🔧 Étapes

1. **Créez le fichier `babyleague/server/.env`** avec le contenu suivant :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-anon-publique
PORT=3002
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

