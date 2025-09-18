const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function AntivirusActifMaisNomOuVersionVide(endpoint, result = null) {

    try{ 
        const nomIncoherence = "Antivirus actif mais nom ou version manquant";
        let score = 3;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (endpoint?.AntivirusActif && (!endpoint.AntivirusNom || !endpoint.AntivirusVersion)) {
                await updateCoherence(endpoint, nomIncoherence, score);
            }
            console.log(`✅ coherence AntivirusActifMaisNomOuVersionVide verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence AntivirusActifMaisNomOuVersionVide");
    }
}

module.exports = AntivirusActifMaisNomOuVersionVide;
