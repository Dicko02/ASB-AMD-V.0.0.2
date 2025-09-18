const Fusion = require('../models/fusion.model');
const NoAD = require('../models/noAD.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function DisqueChiffre() {
    try {
        // Fusionner Fusion et NoAD pour éviter la répétition
        const allData = [
            ...(await Fusion.find()),
            ...(await NoAD.find())
        ];

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;
            let nomConformite = "Chiffrement du disque ne respectant pas la stratégie";

            if (endpoint.etatChiffrement) {
                if (endpoint.etatChiffrement === "Respecte la stratégie") {
                    console.log(`✅ Le disque de l'ordinateur ${endpoint.CN ?? endpoint.Nom} est chiffré`);
                } else {
                    console.log(`❌ Le disque de l'ordinateur ${endpoint.CN ?? endpoint.Nom} n'est pas chiffré`);
                    dangerousityNumber = 1;
                    nonConforme = `${nomConformite}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`⚠️ Les données liées au chiffrement du disque de l'ordinateur ${endpoint.CN ?? endpoint.Nom} ne sont pas disponibles`);
                nomConformite = "État de chiffrement du disque non disponible";
                dangerousityNumber = 2;
                nonConforme = `${nomConformite}(${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du chiffrement du disque :", error);
    }
}

module.exports = DisqueChiffre;
