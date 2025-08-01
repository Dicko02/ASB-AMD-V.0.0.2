const updateCoherence = require('../utility_function/updateCoherence');

async function ContradictionDisque(fusionData) {

    try{

        const nomIncoherence = "Espace disque libre est supperieur 20% mais déclaré insufisant dans non conformes";
        let score = 1;

        const searchEspaceDisqueInsuffisant = fusionData.ConformitiesChecked.some(NonConforme => NonConforme.includes("Pourcentage d'espace total consomme depasse ou est egale a"));

        if (fusionData.VolumesLibres && parseInt(fusionData.VolumesLibres) > 20 && searchEspaceDisqueInsuffisant) {
            await updateCoherence(fusionData, nomIncoherence, score);
        }
            
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ContradictionDisque");
    }

}

module.exports = ContradictionDisque;
