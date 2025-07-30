const Fusion = require('../models/fusion.model');

async function NomDeMachineConforme() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Nom de machine non conforme";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            if(fusionData.CN){
                const nomMachine = fusionData.CN;
                const prefixesConforme = ["WS-", "LP-", "TAB-"];
                const verificationPrefixesConforme = prefixesConforme.some(prefix => nomMachine.startsWith(prefix));

                if (verificationPrefixesConforme) {
                    console.log(`La machine ${fusionData.CN} a un nom conforme`);
                }else {
                    console.log(`La machine ${fusionData.CN} n'a pas un nom conforme`);
                    dangerousityNumber = 2;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 2; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }
    
            }else{
                console.log(`la machine n'existe pas`);
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification de la conformite du nom de la machine:", error);
    }

}

module.exports = NomDeMachineConforme;