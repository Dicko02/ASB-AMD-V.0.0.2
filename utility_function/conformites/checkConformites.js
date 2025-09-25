const runImportAndFusion = require('../runImportAndFusion');
const criticalLevelUpDate = require('./criticalLevelUpDate');

// Modules de conformité
const AntivirusActif = require('../../conformites/AntivirusActif.conformite');
const AntivirusAJour = require('../../conformites/AntivirusAJour.conformite');
const DerniereConnexionUtilisateur = require('../../conformites/DerniereConnexionUtilisateur.conformite');
const DisqueChiffre = require('../../conformites/DisqueChiffre.conformite');
const NomDeMachineConforme = require('../../conformites/NomDeMachineConforme.conformite');
const PareFeuActive = require('../../conformites/PareFeuActive.conformite');
const VolumesPourcentageLibreSuffisant = require('../../conformites/VolumesPourcentageLibreSuffisant.conformite');
const BadLogonCount = require('../../conformites/BadLogonCount.conformite');

const conformitySettingModel = require('../../models/conformitySetting.model');


async function checkConformites(startOrCronJob = false) {
  try {

    // Si c'est le démarrage du serveur ou un cron job, exécuter l'import et la fusion des données
    if(startOrCronJob){
        console.log('Démarrage de l\'importation et de la fusion des données...');
        await runImportAndFusion();
        console.log('Importation et fusion des données terminées.');
    }

    // Récupérer les paramètres de conformité
    const setting = await conformitySettingModel.findOne();
    console.log('Paramètres de conformité récupérés :', setting);

    // Mappage des modules de conformité
    const modules = {
      AntivirusActif,
      AntivirusAJour,
      DerniereConnexionUtilisateur,
      DisqueChiffre,
      NomDeMachineConforme,
      PareFeuActive,
      VolumesPourcentageLibreSuffisant,
      BadLogonCount,
    };

    // Déterminer les vérifications de conformité à exécuter
    let lists = Array.isArray(setting?.conformityToCheck)
      ? setting.conformityToCheck
      : Object.keys(modules); // Liste de secours avec tous les modules

    // Valider et collecter les tâches
    const tasks = [];
    for (const nom of lists) {
      if (nom in modules && typeof modules[nom] === 'function') {
        tasks.push({ name: nom, fn: modules[nom] });
      } else {
        console.warn(`Module invalide ou non-fonction : ${nom}`);
      }
    }

    // Exécuter les tâches séquentiellement
    for (const { name, fn } of tasks) {
      try {
        console.log(`Exécution de la vérification de conformité : ${name}`);
        await fn();
        console.log(`Vérification de conformité terminée : ${name}`);
      } catch (error) {
        console.error(`Erreur dans la vérification de conformité ${name} :`, error);
      }
    }

    // Mettre à jour les niveaux critiques
    console.log('Mise à jour des niveaux critiques...');
    await criticalLevelUpDate(startOrCronJob);
    console.log('Niveaux critiques mis à jour.');

  } catch (error) {
    console.error('Erreur dans checkConformites :', error);
    throw error; // Relancer ou gérer selon les besoins
  }
}

module.exports = checkConformites;