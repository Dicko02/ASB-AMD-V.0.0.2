const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function NomAbsentNomDnsPresent(fusionData, result = null) {

    try{
        const nomIncoherence = "Nom de machine vide alors que Nom DNS et ou Nom Canonique est renseigné";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (!fusionData.CN && (fusionData.DNSHostName || fusionData.CanonicalName)) {
                await updateCoherence(fusionData, nomIncoherence, score)
            }
            console.log(`✅ coherence NomAbsentNomDnsPresent verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomAbsentNomDnsPresent");
    }
}

module.exports = NomAbsentNomDnsPresent;
    