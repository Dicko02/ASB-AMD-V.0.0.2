const updateCoherence = require('../utility_function/updateCoherence');

async function DatesInvalides(fusionData) {

    try{
            
        const nomIncoherence = "Dates antivirus invalides";
        let score = 2;

        if (fusionData?.DerniereAnalyseComplete === "Invalid Date" || fusionData?.DerniereMiseAJourBasesAntivirus === "Invalid Date") {
            await updateCoherence(fusionData, nomIncoherence, score)
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesInvalides");
    }
    
}

module.exports = DatesInvalides;
