const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function resetDatabaseFull() {
  try {
    console.log('🗑️  Réinitialisation complète de la base de données...');
    
    const prisma = new PrismaClient();
    
    // Supprimer toutes les données
    await prisma.goal.deleteMany({});
    console.log('✅ Buts supprimés');
    
    await prisma.match.deleteMany({});
    console.log('✅ Matchs supprimés');
    
    await prisma.player.deleteMany({});
    console.log('✅ Joueurs supprimés');
    
    await prisma.$disconnect();
    
    // Supprimer le fichier de base de données
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Fichier de base de données supprimé');
    }
    
    // Supprimer les migrations (optionnel - commenté pour garder l'historique)
    // const migrationsPath = path.join(__dirname, '../prisma/migrations');
    // if (fs.existsSync(migrationsPath)) {
    //   fs.rmSync(migrationsPath, { recursive: true, force: true });
    //   console.log('✅ Migrations supprimées');
    // }
    
    console.log('✨ Base de données complètement réinitialisée !');
    console.log('💡 Pour recréer la base, exécutez: npm run prisma:migrate');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetDatabaseFull();

