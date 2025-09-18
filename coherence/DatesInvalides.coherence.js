const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function DatesInvalides(endpoint, result = null) {

    try{
        const nomIncoherence = "Dates antivirus invalides";
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (endpoint?.DerniereAnalyseComplete === "Invalid Date" || endpoint?.DerniereMiseAJourBasesAntivirus === "Invalid Date") {
                await updateCoherence(endpoint, nomIncoherence, score)
            }
            console.log(`✅ coherence DatesInvalides verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesInvalides");
    }   
}

module.exports = DatesInvalides;
