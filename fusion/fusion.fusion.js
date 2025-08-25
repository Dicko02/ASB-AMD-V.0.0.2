const AD = require('../models/ad.model');
const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const Fusion = require('../models/fusion.model');
const _ = require("lodash"); // ajout pour comparaison profonde

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
        ...(glpiData ? glpiData.toObject() : {}),
        ...(kasperskyData ? kasperskyData.toObject() : {}),
      };

      // Initialisation sûre
      fusionData.dangerousityNumber = 0;
      const composites = ["AD"];

      // Sécurisation du tableau ConformitiesChecked
      if (!fusionData.ConformitiesChecked) {
        fusionData.ConformitiesChecked = [];
      }

      // Ajustement si absence de données GLPI
      if (!glpiData && !fusionData.ConformitiesChecked.includes(nomConformiteGlpi+`(${dangerousityNumberGlpi})`)) {
        fusionData.dangerousityNumber += dangerousityNumberGlpi;
        fusionData.ConformitiesChecked.push(nomConformiteGlpi+`(${dangerousityNumberGlpi})`);
      } else {
        composites.push("GLPI");
      }

      // Ajustement si absence de données Kaspersky
      if (!kasperskyData && !fusionData.ConformitiesChecked.includes(nomConformiteKaspersky+`(${dangerousityNumberKaspersky})`)) {
        fusionData.dangerousityNumber += dangerousityNumberKaspersky;
        fusionData.ConformitiesChecked.push(nomConformiteKaspersky+`(${dangerousityNumberKaspersky})`);
      } else {
        composites.push("Kaspersky");
      }

      fusionData.Composites = composites;

      // Vérifie si un document avec le même CN existe
      const existing = await Fusion.findOne({ CN: adData.CN });

      if (!existing) {
        await Fusion.create(fusionData); // Si pas trouvé on fait insertion directe

      } else {
        // Vérifie si les données ont changé (comparaison stricte champ par champ)
        // comparaison profonde avec lodash en ignorant les champs techniques MongoDB
        const ignoreFields = ["__v", "createdAt", "updatedAt", "_id"];
        const cleanExisting = _.omit(existing.toObject(), ignoreFields);
        const cleanFusion = _.omit(fusionData, ignoreFields);

        const hasChanged = !_.isEqual(cleanExisting, cleanFusion);

        if (hasChanged) {
          await Fusion.findOneAndUpdate(
            { CN: adData.CN },
            fusionData,
            { new: true }
          );
          console.log(`🔄 Mise à jour effectuée pour ${adData.CN}`);
        } else {
          console.log(`✅ Pas de changement détecté pour ${adData.CN}`);
        }
      }
    }

    // Message final une seule fois
    console.log("✅ Fusion terminée avec succès pour tous les ordinateurs.");
  } catch (error) {
    console.error("❌ Erreur dans l'ajout ou la fusion :", error);
  }
};

module.exports = fusion;
