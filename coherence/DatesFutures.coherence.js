const updateCoherence = require('../utility_function/updateCoherence');

const { isFuture } = require("date-fns");

async function DatesFutures(fusionData) {

    try{
            
        const nomIncoherence = "Date de derniere connexion dans le futur";
        let score = 2;

        if (fusionData.LastLogonDate && isFuture(new Date(fusionData.LastLogonDate))) {
            await updateCoherence(fusionData, nomIncoherence, score)
        }

    }catch(err){
        console.error("erreur lors de la verification de la coerence DatesFutures");
    }
    
}

module.exports = DatesFutures;
