const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

const { isFuture } = require("date-fns");

async function DatesFutures(fusionData, result = null) {

    try{ 
        const nomIncoherence = "Date de derniere connexion dans le futur";
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData.LastLogonDate && isFuture(new Date(fusionData.LastLogonDate))) {
                await updateCoherence(fusionData, nomIncoherence, score)
            }
            console.log(`✅ coherence DatesFutures verifier avec succes pour ${fusionData.CN}`);
        }

    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesFutures");
    }
}

module.exports = DatesFutures;
