const updateCoherence = require('../utility_function/updateCoherence');

async function AntivirusActifMaisNomOuVersionVide(fusionData) {

    try{
            
        const nomIncoherence = "Antivirus actif mais nom ou version manquant";
        let score = 3;

        if (fusionData?.AntivirusActif && (!fusionData.AntivirusNom || !fusionData.AntivirusVersion)) {
            await updateCoherence(fusionData, nomIncoherence, score);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence AntivirusActifMaisNomOuVersionVide");
    }

}

module.exports = AntivirusActifMaisNomOuVersionVide;
