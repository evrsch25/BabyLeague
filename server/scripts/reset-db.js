const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Suppression de toutes les données...');
    
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await prisma.goal.deleteMany({});
    console.log('✅ Buts supprimés');
    
    await prisma.match.deleteMany({});
    console.log('✅ Matchs supprimés');
    
    await prisma.player.deleteMany({});
    console.log('✅ Joueurs supprimés');
    
    console.log('✨ Base de données réinitialisée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

