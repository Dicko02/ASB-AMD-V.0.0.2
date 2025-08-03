const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function BadLogonCount() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Nombre de mauvaise connection a la machine depassant 3";
        let dangerousityNumber = 0;
        let nonConforme;
    
        for (const fusionData of allFusionData) {
            if(fusionData.BadLogonCount){
                const badLogonCount = fusionData.BadLogonCount;
                if(badLogonCount <= 3){
                    console.log(`le nombre de mauvaise connection a la machine ${fusionData.CN} est de ${badLogonCount}`);
                }else{
                    console.log(`ATTENTION : le nombre de mauvaise connection a la machine ${fusionData.CN} est de ${badLogonCount}, il est superieur a 3, il faut investiguer`);
                    dangerousityNumber = 2;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
                }
    
            }else{
                console.log(`les donnees lie au nombre de mauvaise connection a la machine ${fusionData.CN} ne sont pas disponible`);
                nomConformite = "Nombre de mauvaise connection a la machine non disponible";
                dangerousityNumber = 3;
                nonConforme = nomConformite+`(${dangerousityNumber})`;
                updateConformity(fusionData, nonConforme, dangerousityNumber);
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification du nombre de mauvaise connection a la machine:", error);
    }

}

module.exports = BadLogonCount;