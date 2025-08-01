const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/updateConformity');

async function PareFeuActive() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Pare-feu inactif";
        let dangerousityNumber = 0;
        let nonConforme;
    
        for (const fusionData of allFusionData) {
            if(fusionData.etat && fusionData.groupeParent){
                if(fusionData.etat === "OK/Visible"){
                    console.log(`le pare feu de la machine ${fusionData.CN} est activer`)
                }else{
                    console.log(`le pare feu de la machine ${fusionData.CN} est desactiver`)
                    dangerousityNumber = 1;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
                }
            }else{
                console.log(`les donnees lie au pare feu de la machine ${fusionData.CN} ne sont pas disponible`)
                let nomConformite = "Donnees lie au pare feu non disponible";
                dangerousityNumber = 2;
                nonConforme = nomConformite+`(${dangerousityNumber})`;
                updateConformity(fusionData, nonConforme, dangerousityNumber);
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification de l'etat du pare feu:", error);
    }

}

module.exports = PareFeuActive;