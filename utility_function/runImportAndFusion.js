const importAd = require("../imports/ad.import");
const importKaspersky = require("../imports/kaspersky.import");
const importGlpi = require("../imports/glpi.import")
const fusion = require("../fusion/fusion.fusion");
const noAD = require("../fusion/noAD.fusion")

// Fonction principale pour exécuter l'importation et la fusion
async function runImportAndFusion() {
  await importAd();
  await importKaspersky();
  await importGlpi();
  await fusion();
  await noAD();
  console.log("✅ Processus complet terminé.");
}

module.exports = runImportAndFusion;