const Fusion = require('../models/fusion.model');
const NoAD = require('../models/noAD.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function AntivirusActif() {
    try {
        // Fusionner les données Fusion et NoAD
        const allData = [
            ...(await Fusion.find()),
            ...(await NoAD.find())
        ];

        const nomConformiteBase = "Antivirus Inactif";

        // Parcourir chaque endpoint
        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;
            let nomConformite = nomConformiteBase;

            if (endpoint.AntivirusNom) {
                const noms = endpoint.AntivirusNom.split("<br>").map(p => p.trim());
                const nomKaspersky = noms.includes("Kaspersky Endpoint Security");

                if (nomKaspersky && noms.length === 2) {
                    const position = noms[0] === "Kaspersky Endpoint Security" ? 0 : 1;
                    const activites = endpoint.AntivirusActif.split("<br>").map(p => p.trim());

                    if (activites[position] === "Oui") {
                        console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${endpoint.CN ?? endpoint.Nom}.`);
                    } else {
                        console.log(`❌ L'antivirus Kaspersky n'est pas actif sur l'ordinateur ${endpoint.CN ?? endpoint.Nom}.`);
                        dangerousityNumber = 1;
                        nonConforme = `${nomConformite}(${dangerousityNumber})`;
                        updateConformity(endpoint, nonConforme, dangerousityNumber);
                    }
                } else if (nomKaspersky && noms.length === 1) {
                    console.log(`✅ L'antivirus Kaspersky est actif sur l'ordinateur ${endpoint.CN ?? endpoint.Nom}.`);
                } else {
                    console.log(`❌ L'antivirus Kaspersky n'est pas présent sur l'ordinateur ${endpoint.CN ?? endpoint.Nom}.`);
                    dangerousityNumber = 2;
                    nonConforme = `Antivirus Inexistant(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de l'antivirus actif :", error);
    }
}

module.exports = AntivirusActif;
