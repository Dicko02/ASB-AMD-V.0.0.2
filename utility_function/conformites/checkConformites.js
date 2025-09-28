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

const conformitySettingModel = require('../../models/conformitySetting.model'); // Pour récupérer les paramètres de conformité

const conformityDangerosityNumberModel = require('../../models/conformityDangerosityNumber.model'); // Pour récupérer les paramètres de dangerosité

const criticalLevelMaxValueModel = require('../../models/criticalLevelMaxValue.model'); // Pour récupérer les paramètres de niveaux de criticité


// Fonction principale pour vérifier les conformités
async function checkConformites(startOrCronJob = false) {
  try {

    // Si c'est le démarrage du serveur ou un cron job, exécuter l'import et la fusion des données
    console.log('Démarrage de l\'importation et de la fusion des données...');
    await runImportAndFusion(startOrCronJob);
    console.log('Importation et fusion des données terminées.');
    

    let dangerosityParams = await conformityDangerosityNumberModel.findOne(); // Récupérer les paramètres de dangerosité
    // Si les paramètres de dangerosité n'existent pas on en créer un document par défaut
    if(!dangerosityParams){
      dangerosityParams = await conformityDangerosityNumberModel.create({
        AntivirusActif: [{ Wrong: 1, Absent: 2 }],
        AntivirusAJour: [{ Wrong: 1, Absent: 2 }],
        BadLogonCount: [{ Wrong: 2, Absent: 3 }],
        DerniereConnexionUtilisateur: [{ Wrong: 2, Absent: 3 }],
        DisqueChiffre: [{ Wrong: 1, Absent: 2 }],
        NomDeMachineConforme: [{ Wrong: 2, Absent: 3 }],
        PareFeuActive: [{ Wrong: 1, Absent: 2 }],
        VolumesPourcentageLibreSuffisant: [{ Wrong01: 1, Wrong02: 2, Wrong03: 3, Absent: 3 }],
        NoAD: 10,
        NoGLPI: 10,
        NoKaspersky: 10
      });
    };


    let ConformitySetting = await conformitySettingModel.findOne(); // Récupérer les paramètres de conformité
    // Si les paramètres de conformité n'existent pas on en créer un document par défaut
    if(!ConformitySetting){
      ConformitySetting = await conformitySettingModel.create({
        conformityToCheck: [
          "AntivirusActif",
          "AntivirusAJour",
          "DerniereConnexionUtilisateur",
          "DisqueChiffre",
          "NomDeMachineConforme",
          "PareFeuActive",
          "VolumesPourcentageLibreSuffisant",
          "BadLogonCount"
        ]
      });
    }


    let criticalLevelParams = await criticalLevelMaxValueModel.findOne(); // Récupérer les paramètres de niveaux de criticité
    // Si les paramètres de niveaux de criticité n'existent pas on en créer un document par défaut
    if(!criticalLevelParams){
      criticalLevelParams = await criticalLevelMaxValueModel.create({
        lowMaxValue: 3,
        mediumMaxValue: 6,
        highMaxValue: 10
      });
    }


    // Mappage des modules de conformité AVEC paramètres
    const modules = {

      AntivirusActif: () => AntivirusActif(
        dangerosityParams?.AntivirusActif[0]?.Wrong ?? 1,
        dangerosityParams?.AntivirusActif[0]?.Absent ?? 2
      ),

      AntivirusAJour: () => AntivirusAJour(
        dangerosityParams?.AntivirusAJour[0]?.Wrong ?? 1,
        dangerosityParams?.AntivirusAJour[0]?.Absent ?? 2
      ),

      DerniereConnexionUtilisateur: () => DerniereConnexionUtilisateur(
        dangerosityParams?.DerniereConnexionUtilisateur[0]?.Wrong ?? 2,
        dangerosityParams?.DerniereConnexionUtilisateur[0]?.Absent ?? 3
      ),

      DisqueChiffre: () => DisqueChiffre(
        dangerosityParams?.DisqueChiffre[0]?.Wrong ?? 1,
        dangerosityParams?.DisqueChiffre[0]?.Absent ?? 2
      ),

      NomDeMachineConforme: () => NomDeMachineConforme(
        dangerosityParams?.NomDeMachineConforme[0]?.Wrong ?? 2,
        dangerosityParams?.NomDeMachineConforme[0]?.Absent ?? 3
      ),

      PareFeuActive: () => PareFeuActive(
        dangerosityParams?.PareFeuActive[0]?.Wrong ?? 1,
        dangerosityParams?.PareFeuActive[0]?.Absent ?? 2
      ),

      VolumesPourcentageLibreSuffisant: () => VolumesPourcentageLibreSuffisant(
        dangerosityParams?.VolumesPourcentageLibreSuffisant[0]?.Wrong01 ?? 1,
        dangerosityParams?.VolumesPourcentageLibreSuffisant[0]?.Wrong02 ?? 2,
        dangerosityParams?.VolumesPourcentageLibreSuffisant[0]?.Wrong03 ?? 3,
        dangerosityParams?.VolumesPourcentageLibreSuffisant[0]?.Absent ?? 3
      ),

      BadLogonCount: () => BadLogonCount(
        dangerosityParams?.BadLogonCount[0]?.Wrong ?? 2,
        dangerosityParams?.BadLogonCount[0]?.Absent ?? 3
      )

    };

    // Déterminer les vérifications de conformité à exécuter
    let lists = Array.isArray(ConformitySetting?.conformityToCheck) ? ConformitySetting.conformityToCheck : Object.keys(modules);

    // Valider et collecter les tâches
    const tasks = [];
    for (const nom of lists) {
      if (nom in modules && typeof modules[nom] === 'function') {
        tasks.push({ name: nom, fn: modules[nom] });
      } else {
        console.warn(`Module invalide ou non-fonction : ${nom}`);
      }
    }

    // Exécuter les tâches en parallèle
    await Promise.all(
      tasks.map(({ name, fn }) =>
        fn()
          .then(() => console.log(`✅ Vérification terminée : ${name}`))
          .catch(error => console.error(`❌ Erreur dans la vérification de conformité ${name} :`, error))
      )
    );


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