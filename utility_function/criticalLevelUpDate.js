const Fusion = require('../models/fusion.model');

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
        }
        
    }catch (error) {}

}

module.exports = criticalLevelUpDate;