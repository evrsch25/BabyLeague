#!/bin/bash
echo "Arrêtez d'abord le serveur backend (Ctrl+C) si il est en cours d'exécution"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo "Régénération du client Prisma..."
npx prisma generate
echo ""
echo "Client Prisma régénéré avec succès !"
echo "Vous pouvez maintenant redémarrer le serveur avec: npm run dev"

