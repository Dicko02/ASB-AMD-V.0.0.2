const importAd = require("../imports/ad.import");
const importKaspersky = require("../imports/kaspersky.import");
const importGlpi = require("../imports/glpi.import")
const fusion = require("../fusion/fusion.fusion");
const noAD = require("../fusion/noAD.fusion")
const logHistory = require('../utility_function/loggers/logHistory');

// Fonction principale pour exécuter l'importation et la fusion
async function runImportAndFusion() {
  await importAd().then(() => {
    user = "System";
    action = "✅ Succes de l'importation des donnees depuis AD";
    logHistory(action, user);
  }).catch(() => {
    user = "System";
    action = "Echec de l'importation des donnees depuis AD";
    logHistory(action, user);
  });

  await importKaspersky().then(() => {
    user = "System";
    action = "✅ Succes de l'importation des donnees depuis Kaspersky";
    logHistory(action, user);
  }).catch(() => {
    user = "System";
    action = "Echec de l'importation des donnees depuis Kaspersky";
    logHistory(action, user);
  });

  await importGlpi().then(() => {
    user = "System";
    action = "✅ Succes de l'importation des donnees depuis GLPI";
    logHistory(action, user);
  }).catch(() => {
    user = "System";
    action = "Echec de l'importation des donnees depuis GLPI";
    logHistory(action, user);
  });

  await fusion().then(() => {
    user = "System";
    action = "✅ Succes de la fusion des tous donnees dont l'endpoint existe dans AD";
    logHistory(action, user);
  }).catch(() => {
    user = "System";
    action = "Echec de la fusion des tous donnees dont l'endpoint existe dans AD";
    logHistory(action, user);
  });

  await noAD().then(() => {
    user = "System";
    action = "✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD";
    logHistory(action, user);
  }).catch(() => {
    user = "System";
    action = "Echec de la fusion des tous donnees dont l'endpoint est absent d'AD";
    logHistory(action, user);
  });

  console.log("✅ Processus complet terminé.");
}

module.exports = runImportAndFusion;