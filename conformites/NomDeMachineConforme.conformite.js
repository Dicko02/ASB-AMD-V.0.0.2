const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function NomDeMachineConforme() {
    try {
        // Fusionner Fusion et NoAD pour traiter les deux ensembles en une seule boucle
        const allData = await Fusion.find();

        const prefixesConforme = ["WS-", "LP-", "TAB-", "TB-", "SRV-", /^\d{3}/];
        const nomConformite = "Nom de machine non conforme";

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;

            let nomMachine = endpoint.CN ?? endpoint.Nom;

            if (nomMachine) {

                const verificationPrefixesConforme = prefixesConforme.some(prefix => {
                    if (prefix instanceof RegExp) {
                        return prefix.test(nomMachine);
                    } else {
                        return nomMachine.startsWith(prefix);
                    }
                });

                if (verificationPrefixesConforme) {
                    console.log(`✅ La machine ${nomMachine} a un nom conforme`);
                } else {
                    console.log(`❌ La machine ${nomMachine} n'a pas un nom conforme`);
                    dangerousityNumber = 2;
                    nonConforme = `${nomConformite}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`⚠️ La machine n'existe pas ou nom non défini`);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de la conformité du nom de la machine :", error);
    }
}

module.exports = NomDeMachineConforme;
