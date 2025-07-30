const cron = require('node-cron');
const checkConformites = require("./checkConformites");

// Tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Démarrage de la tâche planifiée...`);

  try {
    await checkConformites();
    console.log(`[${new Date().toISOString()}] Conformités mises à jour avec succès.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erreur pendant l'exécution de la tâche :`, error);
  }
});