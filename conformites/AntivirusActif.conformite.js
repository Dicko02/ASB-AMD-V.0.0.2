const Fusion = require('../models/fusion.model');

async function AntivirusActif() {
    try {
        // Récupérer toutes les données fusionnées
        const allFusionData = await Fusion.find();

        let nomConformite = "Antivirus Inactif";
        let dangerousityNumber = 0;
    
        // Parcourir chaque ordinateur fusionné
        for (const fusionData of allFusionData) {
            // Vérifier si l'antivirus est actif
            if (fusionData.AntivirusNom){
                // Séparer la chaîne même s’il n’y a pas de <br>, et nettoyer les espaces
                const noms = fusionData.AntivirusNom.split("<br>").map(p => p.trim());

                const nomKaspersky = noms.includes("Kaspersky Endpoint Security for Windows");

                if(nomKaspersky && noms.length === 2) {
                    if (noms[0] === "Kaspersky Endpoint Security for Windows") {
                        position = 0;
                    } else if (noms[1] === "Kaspersky Endpoint Security for Windows") {
                        position = 1;
                    }
                    
                    const activites = fusionData.AntivirusActif.split("<br>").map(p => p.trim());

                    if(activites[position] === "Oui") {
                        console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${fusionData.CN}.`);
                    }else {
                        console.log(`❌ L'antivirus Kaspersky n'est pas actif sur l'ordinateur ${fusionData.CN}.`);
                        dangerousityNumber = 1;
                        if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                            fusionData.dangerousityNumber += 1; // Incrémenter le niveau de dangerosité
                            fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                            await fusionData.save(); // Sauvegarder les modifications
                        }
                    }
                } else if(nomKaspersky && noms.length === 1){
                    console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${fusionData.CN}.`);
                }else{
                    console.log(`❌ L'antivirus Kaspersky n'est pas present sur l'ordinateur ${fusionData.CN}.`);
                    nomConformite = "Antivirus Inexistant";
                    dangerousityNumber = 2;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 2;
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }
            }
        }
    
    } catch (error) {
        console.error("Erreur lors de la vérification de l'antivirus actif :", error);
    }
}

module.exports = AntivirusActif;