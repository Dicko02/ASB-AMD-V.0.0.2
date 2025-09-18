const Fusion = require('../../models/fusion.model');
const NoAD = require('../../models/noAD.model');

// Tableau de toutes les règles de cohérence
const rules = [
    require('../../coherence/AnalyseAntivirusAncienne.coherence'),
    require('../../coherence/AntivirusActifMaisNomOuVersionVide.coherence'),
    require('../../coherence/ConnexionCreationEgaleDate.coherence'),
    require('../../coherence/ContradictionAntivirus.coherence'),
    require('../../coherence/ContradictionDisque.coherence'),
    require('../../coherence/DatesFutures.coherence'),
    require('../../coherence/DatesInvalides.coherence'),
    require('../../coherence/DonneesCritiquesManquantes.coherence'),
    require('../../coherence/NomAbsentNomDnsPresent.coherence'),
    require('../../coherence/NomDnsNomCanoniqueCnDifferents.coherence'),
    require('../../coherence/ProtectionActiveAndMiseAJourDateInvalid.coherence')
];

// Fonction utilitaire pour appliquer toutes les règles et calculer le score
async function applyRulesAndScore(dataset) {
    for (const item of dataset) {
        const result = { value: 0 };

        for (const rule of rules) {
            await rule(item, result);
        }

        item.incoherenceTotalScore = result.value;
        await item.save();
    }
}

// Fonction principale
async function scoreTotalPossibleIncoherence() {
    const allFusionData = await Fusion.find();
    const allNoADData = await NoAD.find();

    await applyRulesAndScore(allFusionData);
    await applyRulesAndScore(allNoADData);
}

module.exports = scoreTotalPossibleIncoherence;
