const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function ContradictionDisque(endpoint, result = null) {

    try{
        const nomIncoherence = "Espace disque libre est supperieur 20% mais déclaré insufisant dans non conformes";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            const searchEspaceDisqueInsuffisant = endpoint.ConformitiesChecked.some(NonConforme => NonConforme.includes("Pourcentage d'espace total consomme depasse ou est egale a"));

            if (endpoint.VolumesLibres && parseInt(endpoint.VolumesLibres) > 20 && searchEspaceDisqueInsuffisant) {
                await updateCoherence(endpoint, nomIncoherence, score);
            }
            console.log(`✅ coherence ContradictionDisque verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        } 
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ContradictionDisque");
    }
}

module.exports = ContradictionDisque;
