const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function NomDnsNomCanoniqueCnDifferents(endpoint, result = null) {

    try{
        const nomIncoherence = "Nom ≠ DNS ≠ Canonique";
        let score = 1;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            let Nom = endpoint.CN ?? endpoint.Nom;
            if (Nom && endpoint.DNSHostName && endpoint.CanonicalName) {
                const cn = endpoint.CN.toLowerCase();
                
                if (!endpoint.DNSHostName.toLowerCase().includes(cn) || !endpoint.CanonicalName.toLowerCase().includes(cn)) {
                    await updateCoherence(endpoint, nomIncoherence, score)
                }
            }
            console.log(`✅ coherence NomDnsNomCanoniqueCnDifferents verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence NomDnsNomCanoniqueCnDifferents");
    }
}

module.exports = NomDnsNomCanoniqueCnDifferents;
      