const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

const { isFuture } = require("date-fns");

async function DatesFutures(endpoint, result = null) {

    try{ 
        const nomIncoherence = "Date de derniere connexion dans le futur";
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (endpoint.LastLogonDate && isFuture(new Date(endpoint.LastLogonDate))) {
                await updateCoherence(endpoint, nomIncoherence, score)
            }
            console.log(`✅ coherence DatesFutures verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }

    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesFutures");
    }
}

module.exports = DatesFutures;
