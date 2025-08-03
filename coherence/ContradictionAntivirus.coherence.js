const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function ContradictionAntivirus(fusionData, result = null) {

    try{      
        const nomIncoherence = "Antivirus actif mais signalé inexistant"; // le message lie a l'incoherence
        let score = 2;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            const noms = fusionData.AntivirusNom?.includes("Kaspersky Endpoint Security");
            const actif = fusionData.AntivirusActif?.includes("Oui");

            //verification de l'apparition de "Antivirus Inactif" dans les non conformites
            const searchAntivirusInactifResult = fusionData.ConformitiesChecked.some(NonConforme => NonConforme.includes("Antivirus Inactif"));

            if (noms && actif && searchAntivirusInactifResult) {
                await updateCoherence(fusionData, nomIncoherence, score);
            }
            console.log(`✅ coherence ContradictionAntivirus verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ContradictionAntivirus");
    }
}

module.exports = ContradictionAntivirus;
