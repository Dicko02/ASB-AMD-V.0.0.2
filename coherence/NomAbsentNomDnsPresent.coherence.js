const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function NomAbsentNomDnsPresent(endpoint, result = null) {

    try{
        const nomIncoherence = "Nom de machine vide alors que Nom DNS et ou Nom Canonique est renseigné";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            let Nom = endpoint.CN ?? endpoint.Nom;
            if (!Nom && (endpoint.DNSHostName || endpoint.CanonicalName)) {
                await updateCoherence(endpoint, nomIncoherence, score)
            }
            console.log(`✅ coherence NomAbsentNomDnsPresent verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomAbsentNomDnsPresent");
    }
}

module.exports = NomAbsentNomDnsPresent;
    