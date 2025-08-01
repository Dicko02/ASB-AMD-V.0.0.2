const updateCoherence = require('../utility_function/updateCoherence');

// 10.Protection active mais maj = Invalid
async function ProtectionActiveAndMiseAJourDateInvalid(fusionData) {

    try{
        
        const nomIncoherence = "Antivirus actif mais date de mise à jour invalide";
        let score = 2;

        if (fusionData?.AntivirusActif && fusionData?.DerniereMiseAJourBasesAntivirus === "Invalid Date") {
            await updateCoherence(fusionData, nomIncoherence, score)
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ProtectionActiveAndMiseAJourDateInvalid");
    }

}

module.exports = ProtectionActiveAndMiseAJourDateInvalid;
