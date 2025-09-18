const Fusion = require('../models/fusion.model');
const NoAD = require('../models/noAD.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function PareFeuActive() {
    try {
        // Fusionner Fusion et NoAD pour traiter les deux ensembles en une seule boucle
        const allData = [
            ...(await Fusion.find()),
            ...(await NoAD.find())
        ];

        const nomConformiteDefault = "Pare-feu inactif";

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;

            if (endpoint.etat && endpoint.groupeParent) {
                if (endpoint.etat === "OK/Visible") {
                    console.log(`✅ Le pare-feu de la machine ${endpoint.CN ?? endpoint.Nom} est activé`);
                } else {
                    console.log(`❌ Le pare-feu de la machine ${endpoint.CN ?? endpoint.Nom} est désactivé`);
                    dangerousityNumber = 1;
                    nonConforme = `${nomConformiteDefault}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`⚠️ Les données liées au pare-feu de la machine ${endpoint.CN ?? endpoint.Nom} ne sont pas disponibles`);
                const nomConformite = "Données liées au pare-feu non disponibles";
                dangerousityNumber = 2;
                nonConforme = `${nomConformite}(${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de l'état du pare-feu :", error);
    }
}

module.exports = PareFeuActive;
