const Fusion = require('../models/fusion.model');

async function BadLogonCount() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Nombre de mauvaise connection a la machine depassant 3";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            if(fusionData.BadLogonCount){
                const badLogonCount = fusionData.BadLogonCount;
                if(badLogonCount <= 3){
                    console.log(`le nombre de mauvaise connection a la machine ${fusionData.CN} est de ${badLogonCount}`);
                }else{
                    console.log(`ATTENTION : le nombre de mauvaise connection a la machine ${fusionData.CN} est de ${badLogonCount}, il est superieur a 3, il faut investiguer`);
                    dangerousityNumber = 2;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 2; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }
    
            }else{
                console.log(`les donnees lie au nombre de mauvaise connection a la machine ${fusionData.CN} ne sont pas disponible`);
                nomConformite = "Nombre de mauvaise connection a la machine non disponible";
                dangerousityNumber = 3;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 3;
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save();
                }
            }
        }
        
    }catch (error) {
        console.error("Erreur lors de la vérification du nombre de mauvaise connection a la machine:", error);
    }

}

module.exports = BadLogonCount;