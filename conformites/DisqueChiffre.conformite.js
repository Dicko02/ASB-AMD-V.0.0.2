const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function DisqueChiffre() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Chiffrement du disque ne Respectant pas la stratégie";
        let dangerousityNumber = 0;
        let nonConforme;
    
        for (const fusionData of allFusionData) {
            if(fusionData.etatChiffrement){
                if(fusionData.etatChiffrement === "Respecte la stratégie"){
                    console.log(`le disque de l'ordinateur ${fusionData.CN} est chiffre`)
                }else{
                    console.log(`le disque de l'ordinateur ${fusionData.CN} n'est pas chiffre`);
                    dangerousityNumber = 1;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
                }
                
            }else{
                console.log(`les donnees lie au chiffrement de la machine ${fusionData.CN} ne sont pas disponible`);
                let nomConformite = "Etat de chiffrement du disque non disponible";
                dangerousityNumber = 2;
                nonConforme = nomConformite+`(${dangerousityNumber})`;
                updateConformity(fusionData, nonConforme, dangerousityNumber);
            }

        }

    }catch (error) {
        console.error("Erreur lors de la vérification du chiffrement du disque:", error);
    }

}

module.exports = DisqueChiffre;