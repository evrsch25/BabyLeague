# 📤 Commandes rapides pour pousser sur GitHub

## 🚀 Première fois (initialisation)

```bash
# 1. Aller dans le dossier du projet
cd babyleague

# 2. Initialiser Git
git init

# 3. Ajouter tous les fichiers
git add .

# 4. Créer le premier commit
git commit -m "Initial commit: BabyLeague app with Supabase"

# 5. Créer un repository sur GitHub (via le site web)
# Allez sur https://github.com/new
# Créez un repo nommé "babyleague" (ou autre nom)

# 6. Connecter votre repo local à GitHub
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/babyleague.git
git branch -M main
git push -u origin main
```

## 🔄 Mises à jour (après la première fois)

```bash
# 1. Aller dans le dossier du projet
cd babyleague

# 2. Voir les fichiers modifiés
git status

# 3. Ajouter les fichiers modifiés
git add .

# 4. Créer un commit
git commit -m "Description de vos changements"

# 5. Pousser sur GitHub
git push
```

## 📝 Exemples de messages de commit

- `git commit -m "Fix: Correction du bug de scoring"`
- `git commit -m "Feat: Ajout du système de cookies"`
- `git commit -m "Style: Amélioration de l'UI"`
- `git commit -m "Refactor: Migration vers Supabase"`

