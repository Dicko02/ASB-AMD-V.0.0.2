const updateCoherence = require('../utility_function/updateCoherence');

async function AnalyseAntivirusAncienne(fusionData) {

    try{
            
        const nomIncoherence = "Derniere analyse complete de l'antivirus plus ancienne que derniere mise à jour des bases antivirus";
        let score = 1;

        if (fusionData?.DerniereAnalyseComplete && fusionData?.DerniereMiseAJourBasesAntivirus) {

            const DerniereAnalyseComplete = new Date(fusionData.DerniereAnalyseComplete);
            const DerniereMiseAJourBasesAntivirus = new Date(fusionData.DerniereMiseAJourBasesAntivirus);

            if (DerniereAnalyseComplete < DerniereMiseAJourBasesAntivirus) {
                await updateCoherence(fusionData, nomIncoherence, score);
            }

        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence AnalyseAntivirusAncienne");
    }
    
}

module.exports = AnalyseAntivirusAncienne;
        