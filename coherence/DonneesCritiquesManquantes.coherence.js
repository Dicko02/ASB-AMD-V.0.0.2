const updateCoherence = require('../utility_function/updateCoherence');

async function DonneesCritiquesManquantes(fusionData) {

    try{
            
        const nomIncoherence = "Informations critiques manquantes (IP, utilisateur, volumes...)";
        let score = 3;

        if (!fusionData.IPv4Address || !fusionData.Utilisateur || !fusionData.VolumesPourcentageLibre || !fusionData.Chiffrement || !fusionData.AntivirusNom || !fusionData.AntivirusActif || !fusionData.protectionTempsReel || !fusionData.Enabled) {
            await updateCoherence(fusionData, nomIncoherence, score)
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DonneesCritiquesManquantes");
    }

}

module.exports = DonneesCritiquesManquantes;
