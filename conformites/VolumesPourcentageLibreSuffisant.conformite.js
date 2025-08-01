const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/updateConformity');

async function VolumesPourcentageLibreSuffisant() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Pourcentage d'espace total consomme depasse ou est egale a 70%";
        let dangerousityNumber = 0;
        let nonConforme;
    
        for (const fusionData of allFusionData) {
            if(fusionData.VolumesPourcentageLibre){
                const pourcentageEspaceLibre = parseFloat(fusionData.VolumesPourcentageLibre);

                if (pourcentageEspaceLibre > 30) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est suffisant (${pourcentageEspaceLibre}%)`);
                }else if( pourcentageEspaceLibre <= 30 && pourcentageEspaceLibre > 20) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est haut (${pourcentageEspaceLibre}%)`);
                    dangerousityNumber = 1;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);

                }else if( pourcentageEspaceLibre <= 20 && pourcentageEspaceLibre > 10) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est haut (${pourcentageEspaceLibre}%)`);
                    nomConformite = "Pourcentage d'espace total consomme depasse ou est egale a 80%"
                    dangerousityNumber = 2;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);

                }else {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est critique (${pourcentageEspaceLibre}%)`);
                    nomConformite = "Pourcentage d'espace total consomme depasse ou est egale a 90%"
                    dangerousityNumber = 3;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
                }

            }else{
                console.log(`les donnees lie au pourcentage d'espace consomme par rapport au total de la machine ${fusionData.CN} ne sont pas disponible`);
                nomConformite = "Pourcentage d'espace total consomme non disponible"
                dangerousityNumber = 3;
                nonConforme = nomConformite+`(${dangerousityNumber})`;
                updateConformity(fusionData, nonConforme, dangerousityNumber);
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification du pourcentage d'espace consomme par rapport au total de la machine:", error);
    }

}

module.exports = VolumesPourcentageLibreSuffisant;