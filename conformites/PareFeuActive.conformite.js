const Fusion = require('../models/fusion.model');

async function PareFeuActive() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Pare-feu inactif";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            if(fusionData.etat && fusionData.groupeParent){
                if(fusionData.etat === "OK/Visible"){
                    console.log(`le pare feu de la machine ${fusionData.CN} est activer`)
                }else{
                    console.log(`le pare feu de la machine ${fusionData.CN} est desactiver`)
                    dangerousityNumber = 1;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 1; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }
            }else{
                console.log(`les donnees lie au pare feu de la machine ${fusionData.CN} ne sont pas disponible`)
                let nomConformite = "Donnees lie au pare feu non disponible";
                dangerousityNumber = 2;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 2;
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save();
                }
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification de l'etat du pare feu:", error);
    }

}

module.exports = PareFeuActive;