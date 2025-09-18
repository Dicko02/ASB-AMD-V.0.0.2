const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function ConnexionCreationEgaleDate(endpoint, result = null) {

    try{  
        const nomIncoherence = "derniere connexion et création ont lieu le même jour";
        let score = 0.5;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (endpoint.whenCreated && endpoint.LastLogonDate && endpoint.whenCreated === endpoint.LastLogonDate) {
                await updateCoherence(endpoint, nomIncoherence, score);
            }
            console.log(`✅ coherence ConnexionCreationEgaleDate verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ConnexionCreationEgaleDate");
    }
}

module.exports = ConnexionCreationEgaleDate;       
