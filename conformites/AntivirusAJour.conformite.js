const Fusion = require('../models/fusion.model');
const NoAD = require('../models/noAD.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function AntivirusAJour() {
    try {
        // Fusionner Fusion et NoAD
        const allData = [
            ...(await Fusion.find()),
            ...(await NoAD.find())
        ];

        const nomConformiteBase = "Antivirus non à jour";

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;
            let nomConformite = nomConformiteBase;

            if (endpoint.DerniereMiseAJourBasesAntivirus) {
                const dateDerniereMiseAJour = new Date(endpoint.DerniereMiseAJourBasesAntivirus);
                const dateActuelle = new Date();
                const differenceEnJours = Math.floor((dateActuelle - dateDerniereMiseAJour) / (1000 * 60 * 60 * 24));

                if (differenceEnJours <= 7) {
                    console.log(`✅ L'antivirus de l'ordinateur ${endpoint.CN ?? endpoint.Nom} est à jour.`);
                } else {
                    console.log(`❌ L'antivirus de l'ordinateur ${endpoint.CN ?? endpoint.Nom} n'est pas à jour. Dernière mise à jour il y a ${differenceEnJours} jours.`);
                    dangerousityNumber = 1;
                    nonConforme = `${nomConformite}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`❌ L'ordinateur ${endpoint.CN ?? endpoint.Nom} n'a pas de date de dernière mise à jour des bases antivirus.`);
                nomConformite = "Date de dernière mise à jour de l'antivirus non disponible";
                dangerousityNumber = 2;
                nonConforme = `${nomConformite}(${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de la dernière mise à jour de l'antivirus:", error);
    }
}

module.exports = AntivirusAJour;
