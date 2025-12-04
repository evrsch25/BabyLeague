@echo off
echo Arrêtez d'abord le serveur backend (Ctrl+C) si il est en cours d'exécution
echo.
pause
echo Régénération du client Prisma...
npx prisma generate
echo.
echo Client Prisma régénéré avec succès !
echo Vous pouvez maintenant redémarrer le serveur avec: npm run dev
pause

