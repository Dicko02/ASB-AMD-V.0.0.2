const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function DonneesCritiquesManquantes(fusionData, result = null) {

    try{  
        const nomIncoherence = "Informations critiques manquantes (IP, utilisateur, volumes...)";
        let score = 3;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (!fusionData.IPv4Address || !fusionData.Utilisateur || !fusionData.VolumesPourcentageLibre || !fusionData.Chiffrement || !fusionData.AntivirusNom || !fusionData.AntivirusActif || !fusionData.protectionTempsReel || !fusionData.Enabled) {
                await updateCoherence(fusionData, nomIncoherence, score)
            }
            console.log(`✅ coherence DonneesCritiquesManquantes verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DonneesCritiquesManquantes");
    }
}

module.exports = DonneesCritiquesManquantes;
