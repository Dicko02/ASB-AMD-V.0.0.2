const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function ContradictionDisque(fusionData, result = null) {

    try{
        const nomIncoherence = "Espace disque libre est supperieur 20% mais déclaré insufisant dans non conformes";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            const searchEspaceDisqueInsuffisant = fusionData.ConformitiesChecked.some(NonConforme => NonConforme.includes("Pourcentage d'espace total consomme depasse ou est egale a"));

            if (fusionData.VolumesLibres && parseInt(fusionData.VolumesLibres) > 20 && searchEspaceDisqueInsuffisant) {
                await updateCoherence(fusionData, nomIncoherence, score);
            }
            console.log(`✅ coherence ContradictionDisque verifier avec succes pour ${fusionData.CN}`);
        } 
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ContradictionDisque");
    }
}

module.exports = ContradictionDisque;
