const Fusion = require('../models/fusion.model');

async function DerniereConnexionUtilisateur() {

    try {
        const allFusionData = await Fusion.find();

        let nomConformite = "Dernière connexion utilisateur remontant a plus d'un mois";
        let dangerousityNumber = 0;
    
        for (const fusionData of allFusionData) {

            if(fusionData.LastLogonDate){
                const dateDerniereConnexion = new Date(fusionData.LastLogonDate);
                const dateActuelle = new Date();
                const differenceEnJours = Math.floor((dateActuelle - dateDerniereConnexion) / (1000 * 60 * 60 * 24));
                if(differenceEnJours > 30){
                    console.log(`la derniere connexion de l'ordinateur ${fusionData.CN} remonte a plus de 30 jours`);
                    console.log(`date de la derniere connexion = ${dateDerniereConnexion}`);

                    dangerousityNumber = 2;
                    if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                        fusionData.dangerousityNumber += 2; // Incrémenter le niveau de dangerosité
                        fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                        await fusionData.save(); // Sauvegarder les modifications
                    }
                }

            }else{
                console.log(`les donnees lie a la derniere connexion a la machine ${fusionData.CN} ne sont pas disponible`)
                nomConformite = "Date de dernière connexion de l'utilisateur non disponible";
                dangerousityNumber = 3;
                if (!fusionData.ConformitiesChecked.includes(nomConformite+`(${dangerousityNumber})`)) {
                    fusionData.dangerousityNumber += 3; // Incrémenter le niveau de dangerosité
                    fusionData.ConformitiesChecked.push(nomConformite+`(${dangerousityNumber})`);
                    await fusionData.save(); // Sauvegarder les modifications
                }
            }
        }
    }catch (error) {
        console.error("Erreur lors de la vérification de la derniere connexion a l'ordinateur:", error);  
    }

}

module.exports = DerniereConnexionUtilisateur;