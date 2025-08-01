const updateCoherence = require('../utility_function/updateCoherence');

async function ContradictionAntivirus(fusionData) {

    try{
            
        const nomIncoherence = "Antivirus actif mais signalé inexistant"; // le message lie a l'incoherence
        let score = 2;

        const noms = fusionData.AntivirusNom?.includes("Kaspersky Endpoint Security");
        const actif = fusionData.AntivirusActif?.includes("Oui");

        //verification de l'apparition de "Antivirus Inactif" dans les non conformites
        const searchAntivirusInactifResult = fusionData.ConformitiesChecked.some(NonConforme => NonConforme.includes("Antivirus Inactif"));

        if (noms && actif && searchAntivirusInactifResult) {
            await updateCoherence(fusionData, nomIncoherence, score);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence ContradictionAntivirus");
    }
    
}

module.exports = ContradictionAntivirus;
