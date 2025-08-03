const Fusion = require('../../models/fusion.model')
const AnalyseAntivirusAncienne = require('../../coherence/AnalyseAntivirusAncienne.coherence');
const AntivirusActifMaisNomOuVersionVide = require('../../coherence/AntivirusActifMaisNomOuVersionVide.coherence');
const ConnexionCreationEgaleDate = require('../../coherence/ConnexionCreationEgaleDate.coherence');
const ContradictionAntivirus = require('../../coherence/ContradictionAntivirus.coherence');
const ContradictionDisque = require('../../coherence/ContradictionDisque.coherence');
const DatesFutures = require('../../coherence/DatesFutures.coherence');
const DatesInvalides = require('../../coherence/DatesInvalides.coherence');
const DonneesCritiquesManquantes = require('../../coherence/DonneesCritiquesManquantes.coherence');
const NomAbsentNomDnsPresent = require('../../coherence/NomAbsentNomDnsPresent.coherence');
const NomDnsNomCanoniqueCnDifferents = require('../../coherence/NomDnsNomCanoniqueCnDifferents.coherence');
const ProtectionActiveAndMiseAJourDateInvalid = require('../../coherence/ProtectionActiveAndMiseAJourDateInvalid.coherence');

// Fonction principale pour évaluer la cohérence d’un enpoint
async function scoreTotalPossibleIncoherence() {
            
    // Récupérer toutes les données fusionnées
    const allFusionData = await Fusion.find();

    // Parcourir chaque ordinateur fusionné
    for (const fusionData of allFusionData) {
        const result = { value: 0 };

        await AnalyseAntivirusAncienne(fusionData, result);
        await AntivirusActifMaisNomOuVersionVide(fusionData, result);
        await ConnexionCreationEgaleDate(fusionData, result);
        await ContradictionAntivirus(fusionData, result);
        await ContradictionDisque(fusionData, result);
        await DatesFutures(fusionData, result);
        await DatesInvalides(fusionData, result);
        await DonneesCritiquesManquantes(fusionData, result);
        await NomAbsentNomDnsPresent(fusionData, result);
        await NomDnsNomCanoniqueCnDifferents(fusionData, result);
        await ProtectionActiveAndMiseAJourDateInvalid(fusionData, result);

        fusionData.incoherenceTotalScore = result.value;
        await fusionData.save();
    }

}

module.exports = scoreTotalPossibleIncoherence;
