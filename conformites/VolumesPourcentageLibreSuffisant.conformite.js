const Fusion = require('../models/fusion.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function VolumesPourcentageLibreSuffisant(wrong01, wrong02, wrong03, absent) {
    try {
        // Fusionner Fusion et NoAD pour traiter les deux ensembles en une seule boucle
        const allData = await Fusion.find();

        for (const endpoint of allData) {
            let nomConformite = "Pourcentage d'espace total consommé";
            let dangerousityNumber = 0;
            let nonConforme;

            if (endpoint.VolumesPourcentageLibre != null) {
                const pourcentageEspaceLibre = parseFloat(endpoint.VolumesPourcentageLibre);

                if (pourcentageEspaceLibre > 30) {
                    console.log(`✅ Le pourcentage d'espace consommé de la machine ${endpoint.CN ?? endpoint.Nom} est suffisant (${pourcentageEspaceLibre}%)`);
                } else if (pourcentageEspaceLibre <= 30 && pourcentageEspaceLibre > 20) {
                    console.log(`⚠️ Le pourcentage d'espace consommé de la machine ${endpoint.CN ?? endpoint.Nom} est haut (${pourcentageEspaceLibre}%)`);
                    dangerousityNumber = wrong01;
                    nonConforme = `${nomConformite} >=70% (${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                } else if (pourcentageEspaceLibre <= 20 && pourcentageEspaceLibre > 10) {
                    console.log(`⚠️ Le pourcentage d'espace consommé de la machine ${endpoint.CN ?? endpoint.Nom} est très haut (${pourcentageEspaceLibre}%)`);
                    dangerousityNumber = wrong02;
                    nonConforme = `${nomConformite} >=80% (${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                } else {
                    console.log(`❌ Le pourcentage d'espace consommé de la machine ${endpoint.CN ?? endpoint.Nom} est critique (${pourcentageEspaceLibre}%)`);
                    dangerousityNumber = wrong03;
                    nonConforme = `${nomConformite} >=90% (${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                }
            } else {
                console.log(`⚠️ Données manquantes pour le pourcentage d'espace consommé de la machine ${endpoint.CN ?? endpoint.Nom}`);
                dangerousityNumber = absent;
                nonConforme = `${nomConformite} non disponible (${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification du pourcentage d'espace consommé :", error);
    }
}

module.exports = VolumesPourcentageLibreSuffisant;
