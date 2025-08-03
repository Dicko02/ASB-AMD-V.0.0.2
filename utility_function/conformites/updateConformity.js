
async function updateConformity(endpoint, nonConforme, score) {
    if (!endpoint.ConformitiesChecked.includes(nonConforme)) {
        endpoint.ConformitiesChecked.push(nonConforme);
        endpoint.dangerousityNumber += score;
        await endpoint.save(); // Sauvegarder les modifications
    }
}

module.exports = updateConformity;
