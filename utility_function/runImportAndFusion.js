const importAd = require("../imports/ad.import");
const importKaspersky = require("../imports/kaspersky.import");
const importGlpi = require("../imports/glpi.import")
const fusion = require("../fusion/fusion.fusion");
const logHistory = require('../utility_function/loggers/logHistory');
const connectDB = require('../config/db_config');

// Fonction principale pour exécuter l'importation et la fusion
async function runImportAndFusion(startOrCronJob = false) {
  user = "System";

  // Connexion à la base de données
  await connectDB();

  if (startOrCronJob) {
    console.log("✅ Démarrage de l'importation des données...");
    // Importer les données
    await importAd();
    await importKaspersky();
    await importGlpi();
    console.log("✅ Importation des données terminée.");
  };

  console.log("✅ Démarrage de la fusion des données...");
  // Fusionner les données
  await fusion().then(() => {
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint existe dans AD", user);
    console.log("✅ Fusion des données terminée.");
  }).catch(() => {
    logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint existe dans AD", user);
    console.log("❌ Echec de la fusion des données.");
  });

  console.log("✅ Processus complet terminé.");
}

module.exports = runImportAndFusion;