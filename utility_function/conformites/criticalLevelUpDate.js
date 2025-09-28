const Fusion = require('../../models/fusion.model');
const logApp = require('../loggers/logApp');
const typeMachine = require('../typeMachine');
const sendMail = require('../mail/sendMail');
const updateMail = require('../mail/updateMail');
const criticalLevelMaxValue = require('../../models/criticalLevelMaxValue.model');

// Fonction générique pour traiter un ensemble de documents
async function processDataSet(dataSet, startOrCronJob = false) {

    // Récupérer les paramètres de niveaux de criticité
    const levelParams = await criticalLevelMaxValue.findOne();
    const lowMax = levelParams ? levelParams.lowMaxValue : 3;
    const mediumMax = levelParams ? levelParams.mediumMaxValue : 6;
    const highMax = levelParams ? levelParams.highMaxValue : 10;

    
    // Parcourir chaque document et mettre à jour le niveau de criticité et d'autres champs
    for (const data of dataSet) {
        const criticalNumber = data.dangerousityNumber;

        // Attribution du niveau de criticité
        if (criticalNumber <= lowMax) {
            data.criticalLevel = "low";
        } else if (criticalNumber <= mediumMax) {
            data.criticalLevel = "medium";
        } else if (criticalNumber <= highMax) {
            data.criticalLevel = "high";
        } else {
            data.criticalLevel = "critical";
        }

        await data.save(); // Enregistrement des modifications

        // Historique
        logApp.info(`l'endpoint ${data.CN ? data.CN : (data.Nom ? data.Nom : "Inconnu")} a un niveau de dangerosite <${data.criticalLevel}>`);

        // Si c'est le démarrage du serveur ou un cron job
        if (startOrCronJob) {
            
            // Typage de la machine
            typeMachine(data);

            // Envoi d’alerte si critique
            if (data.criticalLevel === "critical") {
                await sendMail(data);
            }
            
        }
    }
}

async function criticalLevelUpDate(startOrCronJob = false) {
    try {
        // Récupérer toutes les données
        const allFusionData = await Fusion.find()

        // Traiter le jeu de données
        await processDataSet(allFusionData, startOrCronJob);

        // Mise à jour des mails si c'est le démarrage du serveur ou un cron job
        if (startOrCronJob) {
            await updateMail();
        }

    } catch (error) {
        console.log("erreur lors l'affectation du niveau de criticite, du typage de l'endpoint, de la mise a jour l'historique ou encore de l'envoie de mail d'alerte: ", error);
    }
}

module.exports = criticalLevelUpDate;
