const Fusion = require('../../models/fusion.model');
const NoAD = require('../../models/noAD.model');
const logApp = require('../loggers/logApp');
const typeMachine = require('../typeMachine');
const sendMail = require('../mail/sendMail');
const updateMail = require('../mail/updateMail');

// Fonction générique pour traiter un ensemble de documents
async function processDataSet(dataSet) {
    for (const data of dataSet) {
        const criticalNumber = data.dangerousityNumber;

        // Attribution du niveau de criticité
        if (criticalNumber <= 1) {
            data.criticalLevel = "low";
        } else if (criticalNumber <= 5) {
            data.criticalLevel = "medium";
        } else if (criticalNumber <= 10) {
            data.criticalLevel = "high";
        } else {
            data.criticalLevel = "critical";
        }

        await data.save(); // Enregistrement des modifications

        // Typage de la machine
        typeMachine(data);

        // Historique
        logApp.info(`l'endpoint ${data.CN ? data.CN : (data.Nom ? data.Nom : "Inconnu")} a un niveau de dangerosite <${data.criticalLevel}>`);

        // Envoi d’alerte si critique
        if (data.criticalLevel === "critical") {
            await sendMail(data);
        }
    }
}

async function criticalLevelUpDate() {
    try {
        // Récupérer toutes les données
        const [allFusionData, allNoADData] = await Promise.all([
            Fusion.find(),
            NoAD.find()
        ]);

        // Traiter chaque jeu de données
        await processDataSet(allFusionData);
        await processDataSet(allNoADData);

        // Supprime de la base les demandes déjà traitées
        await updateMail();

    } catch (error) {
        console.log("erreur lors l'affectation du niveau de criticite, du typage de l'endpoint, de la mise a jour l'historique ou encore de l'envoie de mail d'alerte: ", error);
    }
}

module.exports = criticalLevelUpDate;
