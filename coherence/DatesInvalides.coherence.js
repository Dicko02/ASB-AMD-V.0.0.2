const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function DatesInvalides(fusionData, result = null) {

    try{
        const nomIncoherence = "Dates antivirus invalides";
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData?.DerniereAnalyseComplete === "Invalid Date" || fusionData?.DerniereMiseAJourBasesAntivirus === "Invalid Date") {
                await updateCoherence(fusionData, nomIncoherence, score)
            }
            console.log(`✅ coherence DatesInvalides verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesInvalides");
    }   
}

module.exports = DatesInvalides;
