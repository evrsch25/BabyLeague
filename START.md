# 🚀 Commandes pour démarrer BabyLeague

## Option 1 : Démarrer manuellement (2 terminaux)

### Terminal 1 - Backend

```bash
cd babyleague/server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Le serveur backend sera accessible sur `http://localhost:3001`

### Terminal 2 - Frontend

```bash
cd babyleague
npm install
npm start
```

L'application React sera accessible sur `http://localhost:3000`

---

## Option 2 : Scripts automatiques (Windows)

### Script de démarrage complet (start-all.bat)

Créez un fichier `start-all.bat` à la racine du projet :

```batch
@echo off
echo 🚀 Démarrage de BabyLeague...
echo.

echo 📦 Installation des dépendances backend...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation backend
    pause
    exit /b 1
)

echo.
echo 🔧 Configuration Prisma...
call npm run prisma:generate
if errorlevel 1 (
    echo ❌ Erreur lors de la génération Prisma
    pause
    exit /b 1
)

call npm run prisma:migrate
if errorlevel 1 (
    echo ❌ Erreur lors de la migration Prisma
    pause
    exit /b 1
)

echo.
echo 🎯 Démarrage du serveur backend...
start "BabyLeague Backend" cmd /k "npm run dev"

cd ..

echo.
echo 📦 Installation des dépendances frontend...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation frontend
    pause
    exit /b 1
)

echo.
echo 🎨 Démarrage du frontend...
start "BabyLeague Frontend" cmd /k "npm start"

echo.
echo ✅ BabyLeague est en cours de démarrage !
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
```

---

## Option 3 : Commandes rapides (copier-coller)

### Backend (Terminal 1)
```bash
cd babyleague/server && npm install && npm run prisma:generate && npm run prisma:migrate && npm run dev
```

### Frontend (Terminal 2)
```bash
cd babyleague && npm install && npm start
```

---

## ⚠️ Notes importantes

1. **Première fois** : Les commandes `npm install` peuvent prendre quelques minutes
2. **Prisma** : La première migration créera la base de données SQLite
3. **Ports** : Assurez-vous que les ports 3000 et 3001 sont libres
4. **Ordre** : Il est recommandé de démarrer le backend avant le frontend

---

## 🔍 Vérification

Une fois démarré, vous devriez voir :
- ✅ Backend : `🚀 Serveur API démarré sur le port 3001`
- ✅ Frontend : `Compiled successfully!` et ouverture automatique du navigateur

---

## 🛑 Arrêter l'application

Appuyez sur `Ctrl+C` dans chaque terminal pour arrêter les serveurs.

