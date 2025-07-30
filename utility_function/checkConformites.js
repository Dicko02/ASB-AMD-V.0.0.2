// fonction d'utilite(utility_function)
const runImportAndFusion = require('./runImportAndFusion'); 
const criticalLevelUpDate = require('./criticalLevelUpDate');

//les conformites
const AntivirusActif = require("../conformites/AntivirusActif.conformite");
const AntivirusAJour = require("../conformites/AntivirusAJour.conformite");
const DerniereConnexionUtilisateur = require("../conformites/DerniereConnexionUtilisateur.conformite");
const DisqueChiffre = require("../conformites/DisqueChiffre.conformite");
const NomDeMachineConforme = require("../conformites/NomDeMachineConforme.conformite");
const PareFeuActive = require("../conformites/PareFeuActive.conformite");
const VolumesPourcentageLibreSuffisant = require("../conformites/VolumesPourcentageLibreSuffisant.conformite");
const BadLogonCount = require("../conformites/BadLogonCount.conformite");

const conformitySettingModel = require('../models/conformitySetting.model');

// Fonction de verification des conformités
async function checkConformites(){
    
    // Exécution de l'importation et de la fusion des données
    await runImportAndFusion();//a decommente plus tard

    const setting = await conformitySettingModel.findOne();

    // Objet de correspondance : clé = nom (string), valeur = objet réel
    const modules = {
        AntivirusActif,
        AntivirusAJour,
        DerniereConnexionUtilisateur,
        DisqueChiffre,
        NomDeMachineConforme,
        PareFeuActive,
        VolumesPourcentageLibreSuffisant,
        BadLogonCount
    };

    // Liste des noms de tâches à rechercher
    let lists;

    if (setting && setting.conformityToCheck) {
        lists = setting.conformityToCheck;
    } else {
        lists = [
            "AntivirusActif",
            "AntivirusAJour",
            "DerniereConnexionUtilisateur",
            "DisqueChiffre",
            "NomDeMachineConforme",
            "PareFeuActive",
            "VolumesPourcentageLibreSuffisant",
            "BadLogonCount"
        ];
    }

    // Tableau vide qui va contenir les objets correspondant aux noms trouvés
    let tasks = [];

    // Parcours de chaque nom dans la liste
    for (const nom of lists) {
        // Vérifie si le nom existe bien comme clé dans l'objet `modules`
        if (nom in modules) {
            // Si oui, on ajoute l'objet correspondant dans le tableau `tasks`
            tasks.push(modules[nom]);
        }
    }

    // Exécution des tâches de vérification des conformités
    for (const task of tasks) {
        await task();
    }

    // Mise à jour des niveaux critiques après la vérification des conformités
    await criticalLevelUpDate();
};

// Lancement de la vérification des conformités
module.exports = checkConformites;