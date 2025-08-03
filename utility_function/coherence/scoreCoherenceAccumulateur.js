
function scoreCoherenceAccumulateur(result, score) {
    if (result && typeof result === 'object') {
        result.value = (result.value || 0) + score;
    }
}

module.exports = scoreCoherenceAccumulateur;
