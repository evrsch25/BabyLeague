# 🔐 Variables d'environnement pour Vercel

## ✅ Variables à configurer dans Vercel

Dans Vercel Dashboard → Votre projet → Settings → Environment Variables, vous devez ajouter **2 variables** :

### Variable 1 : SUPABASE_URL

- **Key (Nom)** : `SUPABASE_URL`
- **Value (Valeur)** : `https://dnbrxbemlttdmcergdty.supabase.co`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

### Variable 2 : SUPABASE_ANON_KEY

- **Key (Nom)** : `SUPABASE_ANON_KEY`
- **Value (Valeur)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYnJ4YmVtbHR0ZG1jZXJnZHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTY4NjMsImV4cCI6MjA4MDQzMjg2M30.uKvn6LOF37hpHprptaMzKtINGCIDBnTHPAmDo4JfGDY`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

## 📝 Instructions étape par étape

1. **Allez dans Vercel Dashboard** → Votre projet `BabyLeague`
2. **Cliquez sur "Settings"** (en haut)
3. **Cliquez sur "Environment Variables"** (dans le menu de gauche)
4. **Supprimez les variables d'exemple** (EXAMPLE_NAME) si elles existent
5. **Ajoutez les 2 variables ci-dessus** :
   - Cliquez sur "Add"
   - Entrez le **Key** (nom)
   - Entrez le **Value** (valeur)
   - Cochez **Production**, **Preview** et **Development**
   - Cliquez sur "Save"
6. **Redeployez** votre projet :
   - Allez dans "Deployments"
   - Cliquez sur les "..." du dernier déploiement
   - Cliquez sur "Redeploy"

## ⚠️ Important

- **Ne mettez PAS** `EXAMPLE_NAME` ou des valeurs d'exemple
- Les noms des variables doivent être **exactement** : `SUPABASE_URL` et `SUPABASE_ANON_KEY`
- Les valeurs doivent être **exactement** celles fournies ci-dessus
- Cochez **tous les environnements** (Production, Preview, Development)

## 🔍 Vérification

Après avoir configuré les variables et redéployé, vérifiez que l'API fonctionne :
- Allez sur `https://votre-projet.vercel.app/api/players`
- Vous devriez voir `[]` (tableau vide) si tout fonctionne
- Si vous voyez une erreur, vérifiez les logs dans Vercel Dashboard → Deployments → Votre déploiement → Logs

