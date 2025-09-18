const updateCoherence = require('../utility_function/coherence/updateCoherence');
const scoreCoherenceAccumulateur = require('../utility_function/coherence/scoreCoherenceAccumulateur')

async function DonneesCritiquesManquantes(endpoint, result = null) {

    try{  
        const nomIncoherence = "Informations critiques manquantes (IP, utilisateur, volumes...)";
        let score = 3;

        if(result){
            // 💡 Met à jour le score total seulement si result est fourni
            scoreCoherenceAccumulateur(result, score);
        }else{
            let IP = endpoint.IPv4Address ?? endpoint.IP;
            let nom = endpoint.CN ?? endpoint.Nom;
            let SystemExploitation = endpoint.OperatingSystem ?? endpoint.ExploitationSystem;
            if (!IP || !nom || !SystemExploitation || !endpoint.Utilisateur || !endpoint.VolumesPourcentageLibre || !endpoint.Chiffrement || !endpoint.AntivirusNom || !endpoint.AntivirusActif || !endpoint.protectionTempsReel || !endpoint.Enabled ) {
                await updateCoherence(endpoint, nomIncoherence, score)
            }
            console.log(`✅ coherence DonneesCritiquesManquantes verifier avec succes pour ${endpoint.CN ?? endpoint.Nom}`);
        }
    
    }catch(err){
        console.error("erreur lors de la verification de la coerence DonneesCritiquesManquantes");
    }
}

module.exports = DonneesCritiquesManquantes;
