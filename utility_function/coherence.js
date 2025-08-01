const AnalyseAntivirusAncienne = require('../coherence/AnalyseAntivirusAncienne.coherence');
const AntivirusActifMaisNomOuVersionVide = require('../coherence/AntivirusActifMaisNomOuVersionVide.coherence');
const ConnexionCreationEgaleDate = require('../coherence/ConnexionCreationEgaleDate.coherence');
const ContradictionAntivirus = require('../coherence/ContradictionAntivirus.coherence');
const ContradictionDisque = require('../coherence/ContradictionDisque.coherence');
const DatesFutures = require('../coherence/DatesFutures.coherence');
const DatesInvalides = require('../coherence/DatesInvalides.coherence');
const DonneesCritiquesManquantes = require('../coherence/DonneesCritiquesManquantes.coherence');
const NomAbsentNomDnsPresent = require('../coherence/NomAbsentNomDnsPresent.coherence');
const NomDnsNomCanoniqueCnDifferents = require('../coherence/NomDnsNomCanoniqueCnDifferents.coherence');
const ProtectionActiveAndMiseAJourDateInvalid = require('../coherence/ProtectionActiveAndMiseAJourDateInvalid.coherence');

// Fonction principale pour évaluer la cohérence d’un enpoint
async function Coherence() {

    try{
            
        // Récupérer toutes les données fusionnées
        const allFusionData = await Fusion.find();

        // Parcourir chaque ordinateur fusionné
        for (const fusionData of allFusionData) {
            await AnalyseAntivirusAncienne(fusionData);
            await AntivirusActifMaisNomOuVersionVide(fusionData);
            await ConnexionCreationEgaleDate(fusionData);
            await ContradictionAntivirus(fusionData);
            await ContradictionDisque(fusionData);
            await DatesFutures(fusionData);
            await DatesInvalides(fusionData);
            await DonneesCritiquesManquantes(fusionData);
            await NomAbsentNomDnsPresent(fusionData);
            await NomDnsNomCanoniqueCnDifferents(fusionData);
            await ProtectionActiveAndMiseAJourDateInvalid(fusionData);            
        }
        
    }catch(err){
        console.error("erreur lors de la verification d'une coerence");
    }

}

module.exports = Coherence;
