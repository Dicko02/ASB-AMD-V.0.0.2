const Fusion = require('../models/fusion.model');
const NoAD = require('../models/noAD.model');
const updateConformity = require('../utility_function/conformites/updateConformity');

async function DerniereConnexionUtilisateur() {
    try {
        // Fusionner Fusion et NoAD
        const allData = [
            ...(await Fusion.find()),
            ...(await NoAD.find())
        ];

        const nomConformiteBase = "Dernière connexion utilisateur remontant à plus d'un mois";

        for (const endpoint of allData) {
            let dangerousityNumber = 0;
            let nonConforme;
            let nomConformite = nomConformiteBase;

            if (endpoint.LastLogonDate) {
                const dateDerniereConnexion = new Date(endpoint.LastLogonDate);
                const dateActuelle = new Date();
                const differenceEnJours = Math.floor((dateActuelle - dateDerniereConnexion) / (1000 * 60 * 60 * 24));

                if (differenceEnJours > 30) {
                    console.log(`❌ La dernière connexion de l'ordinateur ${endpoint.CN ?? endpoint.Nom} remonte à plus de 30 jours`);
                    console.log(`Date de la dernière connexion = ${dateDerniereConnexion}`);

                    dangerousityNumber = 2;
                    nonConforme = `${nomConformite}(${dangerousityNumber})`;
                    updateConformity(endpoint, nonConforme, dangerousityNumber);
                } else {
                    console.log(`✅ L'ordinateur ${endpoint.CN ?? endpoint.Nom} a été utilisé il y a moins de 30 jours`);
                }
            } else {
                console.log(`⚠️ Les données liées à la dernière connexion de l'ordinateur ${endpoint.CN ?? endpoint.Nom} ne sont pas disponibles`);
                nomConformite = "Date de dernière connexion de l'utilisateur non disponible";
                dangerousityNumber = 3;
                nonConforme = `${nomConformite}(${dangerousityNumber})`;
                updateConformity(endpoint, nonConforme, dangerousityNumber);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de la dernière connexion de l'ordinateur :", error);
    }
}

module.exports = DerniereConnexionUtilisateur;
