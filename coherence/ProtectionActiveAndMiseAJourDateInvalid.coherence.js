const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

// 10.Protection active mais maj = Invalid
async function ProtectionActiveAndMiseAJourDateInvalid(endpoint, result = null) {

    try{
        const nomIncoherence = "Antivirus actif mais date de mise à jour invalide";
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (endpoint?.AntivirusActif && endpoint?.DerniereMiseAJourBasesAntivirus === "Invalid Date") {
                await updateCoherence(endpoint, nomIncoherence, score)
            }
            console.log(`✅ coherence ProtectionActiveAndMiseAJourDateInvalid verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ProtectionActiveAndMiseAJourDateInvalid");
    }
}

module.exports = ProtectionActiveAndMiseAJourDateInvalid;
