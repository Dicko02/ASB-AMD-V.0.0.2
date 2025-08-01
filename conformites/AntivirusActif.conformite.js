const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/updateConformity');

async function AntivirusActif() {
    try {
        // Récupérer toutes les données fusionnées
        const allFusionData = await Fusion.find();

        let nomConformite = "Antivirus Inactif";
        let dangerousityNumber = 0;
        let nonConforme;
    
        // Parcourir chaque ordinateur fusionné
        for (const fusionData of allFusionData) {
            // Vérifier si l'antivirus est actif
            if (fusionData.AntivirusNom){
                // Séparer la chaîne même s’il y a pas de <br>, et nettoyer les espaces
                const noms = fusionData.AntivirusNom.split("<br>").map(p => p.trim());

                const nomKaspersky = noms.includes("Kaspersky Endpoint Security");

                if(nomKaspersky && noms.length === 2) {
                    if (noms[0] === "Kaspersky Endpoint Security") {
                        position = 0;
                    } else if (noms[1] === "Kaspersky Endpoint Security") {
                        position = 1;
                    }
                    
                    const activites = fusionData.AntivirusActif.split("<br>").map(p => p.trim());

                    if(activites[position] === "Oui") {
                        console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${fusionData.CN}.`);
                    }else {
                        console.log(`❌ L'antivirus Kaspersky n'est pas actif sur l'ordinateur ${fusionData.CN}.`);
                        dangerousityNumber = 1;
                        nonConforme = nomConformite+`(${dangerousityNumber})`;
                        updateConformity(fusionData, nonConforme, dangerousityNumber);
                    }
                } else if(nomKaspersky && noms.length === 1){
                    console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${fusionData.CN}.`);
                }else{
                    console.log(`❌ L'antivirus Kaspersky n'est pas present sur l'ordinateur ${fusionData.CN}.`);
                    nomConformite = "Antivirus Inexistant";
                    dangerousityNumber = 2;
                    nonConforme = nomConformite+`(${dangerousityNumber})`;
                    updateConformity(fusionData, nonConforme, dangerousityNumber);
                }
            }
        }
    
    } catch (error) {
        console.error("Erreur lors de la vérification de l'antivirus actif :", error);
    }
}

module.exports = AntivirusActif;