const AD = require('../models/ad.model');
const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const Fusion = require('../models/fusion.model');

// fonction permettant de fusionner les données existantes qui ont été importées depuis AD, Kaspersky et GLPI
async function fusion() {

  try {
    // Récupérer toutes les données AD, GLPI et Kaspersky
    const allAdData = await AD.find();
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();

    const nomConformiteKaspersky = "La machine n'existe pas dans Kaspersky";
    const nomConformiteGlpi = "La machine n'apparait pas dans GLPI";

    let dangerousityNumberKaspersky = 10;
    let dangerousityNumberGlpi = 10;

    // Parcourir chaque ordinateur AD
    for (const adData of allAdData) {

      // Recherche des informations supplémentaires en se servant d'un attribut unique partout
      const glpiData = allGlpiData.find(glpi => glpi.Nom === adData.CN);
      const kasperskyData = allKasperskyData.find(kaspersky => kaspersky.Nom === adData.CN);

      // Fusion souple : on copie ce qu'on a seulement
      const fusionData = {
        ...adData.toObject(),
        ...(glpiData ? glpiData.toObject() : {}), // ajoute GLPI seulement s'il existe
        ...(kasperskyData ? kasperskyData.toObject() : {}), // ajoute Kaspersky seulement s'il existe
      };

      // Initialisation sûre du champ dangerousityNumber
      fusionData.dangerousityNumber = 0;

      // Préparer le tableau Composites selon la source
      const composites = ["AD"];

      //tableau de securite pour eviter les erreurs undefined avec "ConformitiesChecked"
      if (!fusionData.ConformitiesChecked) {
        fusionData.ConformitiesChecked = [];
      }

      // Ajustement de dangerousityNumber si absence de données GLPI ou Kaspersky
      if (!glpiData && !fusionData.ConformitiesChecked.includes(nomConformiteGlpi+`(${dangerousityNumberGlpi})`)) {
        fusionData.dangerousityNumber += 10; // Incrémenter le niveau de dangerosité
        fusionData.ConformitiesChecked.push(nomConformiteGlpi+`(${dangerousityNumberGlpi})`);
      } else {
        composites.push("GLPI");
      }

      if (!kasperskyData && !fusionData.ConformitiesChecked.includes(nomConformiteKaspersky+`(${dangerousityNumberKaspersky})`)) {
        fusionData.dangerousityNumber += 10;
        fusionData.ConformitiesChecked.push(nomConformiteKaspersky+`(${dangerousityNumberKaspersky})`);
      } else {
        composites.push("Kaspersky");
      }

      fusionData.Composites = composites;

      // Pour éviter les mises à jour inutiles
      const existing = await Fusion.findOne({ CN: adData.CN });

      if (!existing || JSON.stringify(existing.toObject()) !== JSON.stringify({ ...existing.toObject(), ...fusionData })) {
        await Fusion.findOneAndUpdate(
          { CN: adData.CN }, // filtre
          fusionData, // données fusionnées
          { upsert: true, new: true } // options : crée si pas existant, retourne le doc modifié
        );

        console.log("✅ Fusion mise à jour/ajoutée pour l'ordinateur " + adData.CN);
      } else {
        console.log("ℹ️ Aucune modification nécessaire pour " + adData.CN);
      }
    }

    // Message final en console
    console.log("✅ Fusion terminée avec succès pour tous les ordinateurs.");

  } catch (error) {
    console.error("❌ Erreur dans l'ajout ou la fusion :", error);
  }
};

module.exports = fusion;
