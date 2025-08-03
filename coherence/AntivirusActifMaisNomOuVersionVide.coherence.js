const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function AntivirusActifMaisNomOuVersionVide(fusionData, result = null) {

    try{ 
        const nomIncoherence = "Antivirus actif mais nom ou version manquant";
        let score = 3;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData?.AntivirusActif && (!fusionData.AntivirusNom || !fusionData.AntivirusVersion)) {
                await updateCoherence(fusionData, nomIncoherence, score);
            }
            console.log(`✅ coherence AntivirusActifMaisNomOuVersionVide verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence AntivirusActifMaisNomOuVersionVide");
    }
}

module.exports = AntivirusActifMaisNomOuVersionVide;
