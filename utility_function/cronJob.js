const cron = require('node-cron');
const checkConformites = require("./conformites/checkConformites");

// Tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Démarrage de la tâche planifiée...`);
  let cronjob = true; // Indique que c'est un cron job
  try {
    await checkConformites(cronjob);
    console.log(`[${new Date().toISOString()}] Conformités mises à jour avec succès.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erreur pendant l'exécution de la tâche :`, error);
  }
});