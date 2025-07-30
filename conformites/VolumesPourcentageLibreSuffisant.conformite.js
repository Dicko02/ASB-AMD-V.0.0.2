const Fusion = require('../models/fusion.model');

async function VolumesPourcentageLibreSuffisant() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Pourcentage d'espace total consomme depassant 70%";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            if(fusionData.VolumesPourcentageLibre){
                const pourcentageEspaceConsomme = parseFloat(fusionData.VolumesPourcentageLibre);

                if (pourcentageEspaceConsomme < 70) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est bas (${pourcentageEspaceConsomme}%)`);
                }else if( pourcentageEspaceConsomme >= 70 && pourcentageEspaceConsomme < 80) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est haut (${pourcentageEspaceConsomme}%)`);
                    dangerousityNumber = 1;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 1; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }

                }else if( pourcentageEspaceConsomme >= 80 && pourcentageEspaceConsomme < 90) {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est haut (${pourcentageEspaceConsomme}%)`);
                    nomConformite = "Pourcentage d'espace total consomme depassant 80%"
                    dangerousityNumber = 2;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 2;
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save();
                    }

                }else {
                    console.log(`le pourcentage d'espace consomme de la machine ${fusionData.CN} est critique (${pourcentageEspaceConsomme}%)`);
                    nomConformite = "Pourcentage d'espace total consomme depassant 90%"
                    dangerousityNumber = 3;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 3;
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save();
                    }
                }

            }else{
                console.log(`les donnees lie au pourcentage d'espace consomme par rapport au total de la machine ${fusionData.CN} ne sont pas disponible`);
                nomConformite = "Pourcentage d'espace total consomme non disponible"
                dangerousityNumber = 3;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 3;
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save();
                }
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification du pourcentage d'espace consomme par rapport au total de la machine:", error);
    }

}

module.exports = VolumesPourcentageLibreSuffisant;