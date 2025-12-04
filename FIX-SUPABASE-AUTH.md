# 🔧 Résolution de l'erreur d'authentification Supabase

## ❌ Erreur actuelle
```
Error: P1000: Authentication failed against database server
```

## ✅ Solutions

### Solution 1 : Vérifier le mot de passe dans la connection string

1. **Dans Supabase Dashboard** :
   - Allez dans **Settings** → **Database**
   - Section **Connection string** → **URI**
   - La connection string ressemble à :
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

2. **Remplacez `[YOUR-PASSWORD]`** :
   - ⚠️ **IMPORTANT** : Si votre mot de passe contient des caractères spéciaux, vous devez les encoder en URL :
     - `@` devient `%40`
     - `#` devient `%23`
     - `$` devient `%24`
     - `%` devient `%25`
     - `&` devient `%26`
     - `+` devient `%2B`
     - `=` devient `%3D`
     - `?` devient `%3F`
     - Espace devient `%20`

3. **Exemple** :
   - Mot de passe : `Mon@Mot#De$Passe`
   - Encodé : `Mon%40Mot%23De%24Passe`
   - Connection string finale :
     ```
     postgresql://postgres:Mon%40Mot%23De%24Passe@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
     ```

### Solution 2 : Utiliser la connection string avec Connection Pooling (Recommandé)

1. **Dans Supabase Dashboard** :
   - Settings → Database
   - Connection string → **Connection Pooling**
   - Mode : **Transaction**
   - Copiez la connection string (elle commence par `postgresql://postgres.xxxxx`)

2. **Format** :
   ```
   postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

3. **Avantages** :
   - Meilleure performance
   - Pas besoin d'encoder le mot de passe
   - Recommandé pour la production

### Solution 3 : Réinitialiser le mot de passe de la base de données

Si vous avez oublié le mot de passe :

1. **Dans Supabase Dashboard** :
   - Settings → Database
   - Section **Database password**
   - Cliquez sur **Reset database password**
   - Copiez le nouveau mot de passe
   - Mettez à jour votre `.env`

### Solution 4 : Vérifier le fichier .env

Assurez-vous que votre fichier `babyleague/server/.env` contient :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
PORT=3001
```

⚠️ **Points importants** :
- Pas d'espaces autour du `=`
- Les guillemets sont optionnels mais recommandés
- Pas de saut de ligne dans la connection string

## 🧪 Tester la connexion

1. **Testez avec Prisma Studio** :
   ```bash
   cd babyleague/server
   npx prisma studio
   ```

2. **Testez avec psql** (optionnel) :
   ```bash
   psql "postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres"
   ```

## 🔍 Outil pour encoder le mot de passe

Vous pouvez utiliser JavaScript pour encoder votre mot de passe :

```javascript
// Dans la console du navigateur ou Node.js
encodeURIComponent('VotreMotDePasseAvec@Caractères#Spéciaux')
```

Ou utilisez un outil en ligne : [urlencoder.org](https://www.urlencoder.org/)

## 📝 Exemple complet

Si votre connection string Supabase est :
```
postgresql://postgres:[YOUR-PASSWORD]@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres
```

Et votre mot de passe est : `MyP@ssw0rd#123`

Votre `.env` devrait contenir :
```env
DATABASE_URL="postgresql://postgres:MyP%40ssw0rd%23123@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
```

Ou mieux, utilisez Connection Pooling :
```env
DATABASE_URL="postgresql://postgres.dnbrxbemlttdmcergdty:MyP@ssw0rd#123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

