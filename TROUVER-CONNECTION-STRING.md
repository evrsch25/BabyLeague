# 🔍 Comment trouver la connection string Supabase

## 📍 Où trouver la connection string

Dans Supabase, la connection string peut être trouvée à plusieurs endroits :

### Méthode 1 : Dans Settings → Database → Connection string (section en haut)

1. **Allez dans votre projet Supabase**
2. **Settings** (icône d'engrenage en bas à gauche)
3. **Database**
4. **Faites défiler vers le haut** - Il devrait y avoir une section "Connection string" AVANT "Database password"
5. **Sélectionnez "URI"** dans le menu déroulant
6. **Copiez la connection string**

Si vous ne voyez pas cette section, passez à la méthode 2.

### Méthode 2 : Construire la connection string manuellement

Vous avez besoin de :
- **Host** : Trouvé dans Settings → Database → Connection string (section "Connection info")
- **Database name** : Généralement `postgres`
- **Port** : Généralement `5432`
- **User** : Généralement `postgres`
- **Password** : Le mot de passe que vous avez créé (ou réinitialisé)

#### Étape 1 : Trouver le Host

1. **Settings** → **Database**
2. Cherchez la section **"Connection info"** ou **"Connection parameters"**
3. Vous devriez voir quelque chose comme :
   - **Host** : `db.dnbrxbemlttdmcergdty.supabase.co`
   - **Database name** : `postgres`
   - **Port** : `5432`
   - **User** : `postgres`

#### Étape 2 : Construire la connection string

Format :
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?pgbouncer=true&connect_timeout=15
```

Exemple avec vos informations :
```
postgresql://postgres:VOTRE_MOT_DE_PASSE@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
```

### Méthode 3 : Utiliser Connection Pooling (Recommandé)

1. **Settings** → **Database**
2. Cherchez **"Connection Pooling"** ou **"Pooler"**
3. Vous devriez voir une connection string qui commence par :
   ```
   postgresql://postgres.dnbrxbemlttdmcergdty:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

## 🔑 Obtenir le mot de passe

Si vous avez oublié le mot de passe :

1. **Settings** → **Database**
2. Section **"Database password"**
3. Cliquez sur **"Reset database password"**
4. **Copiez le nouveau mot de passe** (⚠️ vous ne pourrez plus le voir après)
5. Utilisez ce mot de passe dans votre connection string

## 📝 Créer le fichier .env

Créez `babyleague/server/.env` avec :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
PORT=3001
```

**Remplacez `VOTRE_MOT_DE_PASSE`** par votre mot de passe de base de données.

## ⚠️ Si le mot de passe contient des caractères spéciaux

Si votre mot de passe contient `@`, `#`, `$`, `%`, etc., vous devez les encoder :

- Utilisez [urlencoder.org](https://www.urlencoder.org/)
- Collez votre mot de passe
- Copiez le résultat encodé
- Utilisez-le dans la connection string

Exemple :
- Mot de passe : `Mon@Mot#123`
- Encodé : `Mon%40Mot%23123`
- Connection string : `postgresql://postgres:Mon%40Mot%23123@db.dnbrxbemlttdmcergdty.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15`

## 🧪 Tester la connection

Après avoir créé le fichier `.env`, testez :

```bash
cd babyleague/server
npm run prisma:generate
npm run prisma:migrate
```

Si ça fonctionne, vous verrez les migrations s'exécuter !

