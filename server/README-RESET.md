# 🔄 Réinitialisation de la base de données

## Option 1 : Vider toutes les données (recommandé)

Cette commande supprime toutes les données mais garde la structure de la base :

```bash
npm run db:reset
```

**Ce que ça fait :**
- ✅ Supprime tous les joueurs
- ✅ Supprime tous les matchs
- ✅ Supprime tous les buts
- ✅ Garde la structure de la base de données

**Quand l'utiliser :**
- Après des tests
- Pour repartir avec une base vide
- Pour nettoyer les données de test

---

## Option 2 : Réinitialisation complète

Cette commande supprime tout, y compris le fichier de base de données :

```bash
npm run db:reset-full
```

**Ce que ça fait :**
- ✅ Supprime toutes les données
- ✅ Supprime le fichier `dev.db`
- ⚠️ Vous devrez ensuite exécuter `npm run prisma:migrate` pour recréer la base

**Quand l'utiliser :**
- Si vous avez des problèmes avec la base de données
- Pour repartir de zéro complètement

---

## Option 3 : Via Prisma Studio (interface graphique)

1. Ouvrir Prisma Studio :
```bash
npm run prisma:studio
```

2. Dans l'interface, supprimer manuellement les données

---

## ⚠️ Attention

Ces opérations sont **irréversibles**. Assurez-vous de ne pas avoir de données importantes avant de réinitialiser.

---

## 🔄 Après la réinitialisation

Si vous avez utilisé `db:reset-full`, vous devrez recréer la base :

```bash
npm run prisma:migrate
```

Ensuite, redémarrez le serveur :

```bash
npm run dev
```

