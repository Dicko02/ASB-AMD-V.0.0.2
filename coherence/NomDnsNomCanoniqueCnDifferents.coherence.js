const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function NomDnsNomCanoniqueCnDifferents(fusionData, result = null) {

    try{
        const nomIncoherence = "Nom ≠ DNS ≠ Canonique";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            if (fusionData.CN && fusionData.DNSHostName && fusionData.CanonicalName) {
                const cn = fusionData.CN.toLowerCase();
                
                if (!fusionData.DNSHostName.toLowerCase().includes(cn) || !fusionData.CanonicalName.toLowerCase().includes(cn)) {
                    await updateCoherence(fusionData, nomIncoherence, score)
                }
            }
            console.log(`✅ coherence NomDnsNomCanoniqueCnDifferents verifier avec succes pour ${fusionData.CN}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomDnsNomCanoniqueCnDifferents");
    }
}

module.exports = NomDnsNomCanoniqueCnDifferents;
      