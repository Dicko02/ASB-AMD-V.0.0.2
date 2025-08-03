const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function AnalyseAntivirusAncienne(fusionData, result = null) {

    try{
        const nomIncoherence = "Derniere analyse complete de l'antivirus plus ancienne que derniere mise à jour des bases antivirus";
        let score = 1;
        
        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData?.DerniereAnalyseComplete && fusionData?.DerniereMiseAJourBasesAntivirus) {

                const DerniereAnalyseComplete = new Date(fusionData.DerniereAnalyseComplete);
                const DerniereMiseAJourBasesAntivirus = new Date(fusionData.DerniereMiseAJourBasesAntivirus);

                if (DerniereAnalyseComplete < DerniereMiseAJourBasesAntivirus) {
                    await updateCoherence(fusionData, nomIncoherence, score);
                }
                console.log(`✅ coherence AnalyseAntivirusAncienne verifier avec succes pour ${fusionData.CN}`);
            }
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence AnalyseAntivirusAncienne");
    }
}

module.exports = AnalyseAntivirusAncienne;
        