const Fusion = require('../models/fusion.model');

async function DisqueChiffre() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Chiffrement du disque ne Respectant pas la stratégie";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            if(fusionData.etatChiffrement){
                if(fusionData.etatChiffrement === "Respecte la stratégie"){
                    console.log(`le disque de l'ordinateur ${fusionData.CN} est chiffre`)
                }else{
                    console.log(`le disque de l'ordinateur ${fusionData.CN} n'est pas chiffre`);
                    dangerousityNumber = 1;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 1; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }
                
            }else{
                console.log(`les donnees lie au chiffrement de la machine ${fusionData.CN} ne sont pas disponible`);
                let nomConformite = "Etat de chiffrement du disque non disponible";
                dangerousityNumber = 2;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 2;
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save();
                }
            }

        }

    }catch (error) {
        console.error("Erreur lors de la vérification du chiffrement du disque:", error);
    }

}

module.exports = DisqueChiffre;