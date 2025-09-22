const Fusion = require('../../models/fusion.model');

// Liste des règles de cohérence à appliquer
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

// Fonction utilitaire pour appliquer toutes les règles à une collection
async function applyRulesToData(dataset) {
    for (const item of dataset) {
        for (const rule of rules) {
            await rule(item);
        }
    }
}

// Fonction principale pour évaluer la cohérence d’un endpoint
async function Coherence() {
    
    const allFusionData = await Fusion.find();
    await applyRulesToData(allFusionData);
}

module.exports = Coherence;
