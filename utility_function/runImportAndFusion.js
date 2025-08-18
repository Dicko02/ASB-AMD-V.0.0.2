const importAd = require("../imports/ad.import");
const importKaspersky = require("../imports/kaspersky.import");
const importGlpi = require("../imports/glpi.import")
const fusion = require("../fusion/fusion.fusion");
const noAD = require("../fusion/noAD.fusion")
const logHistory = require('../utility_function/loggers/logHistory');

// Fonction principale pour exécuter l'importation et la fusion
async function runImportAndFusion() {
  user = "System";

  await importAd();
  await importKaspersky();
  await importGlpi();

  await fusion().then(() => {
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint existe dans AD", user);

  }).catch(() => {
    logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint existe dans AD", user);
  });

  await noAD().then(() => {
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD", user);

  }).catch(() => {
    logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
  });

  console.log("✅ Processus complet terminé.");
}

module.exports = runImportAndFusion;