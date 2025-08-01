const updateCoherence = require('../utility_function/updateCoherence');

async function NomAbsentNomDnsPresent(fusionData) {

    try{
            
        const nomIncoherence = "Nom de machine vide alors que Nom DNS et ou Nom Canonique est renseigné";
        let score = 1;

        if (!fusionData.CN && (fusionData.DNSHostName || fusionData.CanonicalName)) {
            await updateCoherence(fusionData, nomIncoherence, score)
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomAbsentNomDnsPresent");
    }

}

module.exports = NomAbsentNomDnsPresent;
    