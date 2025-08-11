const Fusion = require('../../models/fusion.model');
const logApp = require('../loggers/logApp');
const typeMachine = require('../typeMachine')

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

        }
        
    }catch (error) {}

}

module.exports = criticalLevelUpDate;