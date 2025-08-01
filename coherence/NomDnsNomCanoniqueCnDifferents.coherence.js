const updateCoherence = require('../utility_function/updateCoherence');

async function NomDnsNomCanoniqueCnDifferents(fusionData) {

    try{
            
        const nomIncoherence = "Nom ≠ DNS ≠ Canonique";
        let score = 1;

        if (fusionData.CN && fusionData.DNSHostName && fusionData.CanonicalName) {

            const cn = fusionData.CN.toLowerCase();
            
            if (!fusionData.DNSHostName.toLowerCase().includes(cn) || !fusionData.CanonicalName.toLowerCase().includes(cn)) {
                await updateCoherence(fusionData, nomIncoherence, score)
            }
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomDnsNomCanoniqueCnDifferents");
    }

}

module.exports = NomDnsNomCanoniqueCnDifferents;
      