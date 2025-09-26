const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function BadLogonCount(wrong, absent) {
    try {
        // Fusionner Fusion et NoAD
        const allData = await Fusion.find();

        const nomConformiteBase = "Nombre de mauvaise connexion à la machine dépassant 3";

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;
            let nomConformite = nomConformiteBase;

            if (endpoint.BadLogonCount != null) {
                const badLogonCount = endpoint.BadLogonCount;
                if (badLogonCount <= 3) {
                    console.log(`✅ Le nombre de mauvaise connexion à la machine ${endpoint.CN ?? endpoint.Nom} est de ${badLogonCount}`);
                } else {
                    console.log(`❌ ATTENTION : le nombre de mauvaise connexion à la machine ${endpoint.CN ?? endpoint.Nom} est de ${badLogonCount}, il est supérieur à 3, il faut investiguer`);
                    dangerousityNumber = wrong;
                    nonConforme = `${nomConformite}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`⚠️ Les données liées au nombre de mauvaise connexion à la machine ${endpoint.CN ?? endpoint.Nom} ne sont pas disponibles`);
                nomConformite = "Nombre de mauvaise connexion à la machine non disponible";
                dangerousityNumber = absent;
                nonConforme = `${nomConformite}(${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification du nombre de mauvaise connexion à la machine :", error);
    }
}

module.exports = BadLogonCount;
