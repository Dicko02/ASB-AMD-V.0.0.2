
// Fonction de creation de l'objet du mail
function object(demandeurNom, endpoint, inconformites){

    firstInconformite = inconformites[0] || 'Aucune inconformité';
    firstInconformiteWithoutScore = firstInconformite.replace(/\(\d+\)/g, '');
    finalFirstInconformite = firstInconformiteWithoutScore.slice(0, 30) + "...";

    return `${demandeurNom}: ${endpoint} | ${finalFirstInconformite}`;
}

module.exports = object;