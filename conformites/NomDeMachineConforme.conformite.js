const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function NomDeMachineConforme() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Nom de machine non conforme";
        let dangerousityNumber = 0;
        let nonConforme;
    
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
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
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