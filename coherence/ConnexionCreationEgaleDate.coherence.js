const updateCoherence = require('../utility_function/updateCoherence');

async function ConnexionCreationEgaleDate(fusionData) {

    try{
            
        const nomIncoherence = "derniere connexion et création ont lieu le même jour";
        let score = 0.5;

        if (fusionData.whenCreated && fusionData.LastLogonDate && fusionData.whenCreated === fusionData.LastLogonDate) {
            await updateCoherence(fusionData, nomIncoherence, score);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ConnexionCreationEgaleDate");
    }

}

module.exports = ConnexionCreationEgaleDate;       
