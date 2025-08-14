const Fusion = require('../../models/fusion.model');
const logApp = require('../loggers/logApp');
const typeMachine = require('../typeMachine')
const sendMail = require('../mail/sendMail')

async function criticalLevelUpDate() {

    try {
        // Récupérer toutes les données fusionnées
        const allFusionData = await Fusion.find();
    
        // Parcourir chaque ordinateur fusionné
        for (const fusionData of allFusionData) {
            
            const criticalNumber = fusionData.dangerousityNumber;

            if(criticalNumber <=1) {

                fusionData.criticalLevel = "low"; // Niveau de danger bas
                await fusionData.save(); // Enregistrement des modifications

            }else if(1 < criticalNumber && criticalNumber <= 5) {

                fusionData.criticalLevel = "medium"; // Niveau de danger moyen
                await fusionData.save();

            }else if(5 < criticalNumber && criticalNumber <= 10) {

                fusionData.criticalLevel = "high"; // Niveau de danger élevé
                await fusionData.save();

            }else {

                fusionData.criticalLevel = "critical"; // Niveau de danger critique
                await fusionData.save();

            }

            //Type de la machine(endpoint)
            typeMachine(fusionData);

            //historique de l'etat des endpoints
            logApp.info(`l'endpoint ${fusionData.CN} a un niveau de dangerosite <${fusionData.criticalLevel}>`);

            //envoie d'un mail d'alerte sur le compte que le collecteur glpi utilise
            if(fusionData.criticalLevel === "critical"){
                await sendMail(fusionData.CN, fusionData.ConformitiesChecked, fusionData.IPv4Address, fusionData.Lieu, fusionData.Utilisateur, fusionData.incoherenceNumber, fusionData.incoherenceTotalScore, fusionData.typeMachine);
            }

        }
        
    }catch (error) {
        console.log("erreur lors l'affectation du niveau de criticite, du typage de l'endpoint, de la mise a jour l'historique ou encore de l'envoie de mail d'alerte: ", error);
    }

}

module.exports = criticalLevelUpDate;