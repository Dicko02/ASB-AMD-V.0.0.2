const Fusion = require('../models/fusion.model');

async function AntivirusAJour() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Antivirus non à jour";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {
            
            // Vérifier si l'ordinateur a une date de dernière mise à jour des bases antivirus
            if(fusionData.DerniereMiseAJourBasesAntivirus) {

                // Calculer la différence en jours entre la date actuelle et la date de dernière mise à jour
                const dateDerniereMiseAJour = new Date(fusionData?.DerniereMiseAJourBasesAntivirus);
                const dateActuelle = new Date();
                const differenceEnJours = Math.floor((dateActuelle - dateDerniereMiseAJour) / (1000 * 60 * 60 * 24));

                // Vérifier si la différence est inférieure ou égale à 7 jours
                if(differenceEnJours <= 7) {
                    console.log(`✅ L'antivirus de l'ordinateur ${fusionData.CN} est à jour.`);
                }else {
                    console.log(`❌ L'antivirus de l'ordinateur ${fusionData.CN} n'est pas à jour. Dernière mise à jour il y a ${differenceEnJours} jours.`);
                    dangerousityNumber = 1;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 1; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }

            }else {
                console.log(`❌ L'ordinateur ${fusionData.CN} n'a pas de date de dernière mise à jour des bases antivirus.`);
                let nomConformite = "Date de derniere mise a jour de l'antivirus non disponible";
                dangerousityNumber = 2;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 2;
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save();
                }
            }
        }

    }catch (error) {
        console.error("Erreur lors de la vérification de la derniere mise à jour de l'antivirus:", error);
    }

}

module.exports = AntivirusAJour;