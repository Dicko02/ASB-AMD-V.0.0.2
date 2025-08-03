const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function ConnexionCreationEgaleDate(fusionData, result = null) {

    try{  
        const nomIncoherence = "derniere connexion et création ont lieu le même jour";
        let score = 0.5;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData.whenCreated && fusionData.LastLogonDate && fusionData.whenCreated === fusionData.LastLogonDate) {
                await updateCoherence(fusionData, nomIncoherence, score);
            }
            console.log(`✅ coherence ConnexionCreationEgaleDate verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ConnexionCreationEgaleDate");
    }
}

module.exports = ConnexionCreationEgaleDate;       
