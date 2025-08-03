
async function updateCoherence(endpoint, nomIncoherence, score) {
    if (!endpoint.incoherences.includes(nomIncoherence)) {
        endpoint.incoherences.push(nomIncoherence);
        endpoint.incoherenceNumber += score;
        await endpoint.save(); // Sauvegarder les modifications
    }
}

module.exports = updateCoherence;
