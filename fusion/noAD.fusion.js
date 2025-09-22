const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const NoAD = require('../models/noAD.model');
const AD = require('../models/ad.model');
const _ = require("lodash");

const relevantFields = [
  "Nom",
  "AntivirusActif",
  "AntivirusNom",
  "AntivirusVersion",
  "Lieu",
  "Utilisateur",
  "VolumesPourcentageLibre",
  "dangerousityNumber",
  "ConformitiesChecked",
  "Composites"
];

async function noAD() {
  try {
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();
    const allAdData = await AD.find();

    // CN déjà présents dans AD
    const adCNs = new Set(allAdData.map(ad => ad.CN));
    const processed = new Set();

    const nomConformiteAD = "La machine n'existe pas dans AD";
    const nomConformiteKaspersky = "La machine n'existe pas dans Kaspersky";
    const nomConformiteGlpi = "La machine n'apparait pas dans GLPI";

    const dangerousityNumberAD = 10;
    const dangerousityNumberKaspersky = 10;
    const dangerousityNumberGlpi = 10;

    // -------- Cas Kaspersky --------
    if (allKasperskyData?.length > 0) {
      for (const kasperskyData of allKasperskyData) {
        if (!kasperskyData.Nom || adCNs.has(kasperskyData.Nom) || processed.has(kasperskyData.Nom)) continue;
        processed.add(kasperskyData.Nom);

        const glpiData = allGlpiData.find(glpi => glpi.Nom === kasperskyData.Nom);

        const noADData = {
          ..._.omit(kasperskyData.toObject(), ["_id", "__v"]),
          ...(glpiData ? _.omit(glpiData.toObject(), ["_id", "__v"]) : {})
        };

        // Initialisation sûre
        noADData.dangerousityNumber = noADData.dangerousityNumber || 0;
        noADData.ConformitiesChecked = noADData.ConformitiesChecked || [];
        noADData.Composites = ["Kaspersky"];

        // Ajout conformités sans doublons
        noADData.ConformitiesChecked = _.union(
          noADData.ConformitiesChecked,
          [`${nomConformiteAD}(${dangerousityNumberAD})`]
        );
        noADData.dangerousityNumber += dangerousityNumberAD;

        if (!glpiData) {
          noADData.ConformitiesChecked = _.union(
            noADData.ConformitiesChecked,
            [`${nomConformiteGlpi}(${dangerousityNumberGlpi})`]
          );
          noADData.dangerousityNumber += dangerousityNumberGlpi;
        } else {
          noADData.Composites.push("GLPI");
        }

        const existing = await NoAD.findOne({ Nom: kasperskyData.Nom });

        if (!existing) {
          await NoAD.create(noADData);
          console.log(`🆕 Ajout noAD pour ${kasperskyData.Nom}`);
        } else {
          // Fusion conformités
          noADData.ConformitiesChecked = _.union(
            existing.ConformitiesChecked || [],
            noADData.ConformitiesChecked
          );

          // Recalcul dangerousityNumber
          noADData.dangerousityNumber = noADData.ConformitiesChecked.reduce((acc, item) => {
            const match = item.match(/\((\d+)\)$/);
            return acc + (match ? parseInt(match[1], 10) : 0);
          }, 0);

          // Comparaison sur champs pertinents
          const cleanExisting = _.pick(existing.toObject(), relevantFields);
          const cleanNew = _.pick(noADData, relevantFields);
          const hasChanged = !_.isEqual(cleanExisting, cleanNew);

          if (hasChanged) {
            await NoAD.findOneAndUpdate({ Nom: kasperskyData.Nom }, noADData, { new: true });
            console.log(`🔄 Mise à jour noAD pour ${kasperskyData.Nom}`);
          } else {
            console.log(`✅ Pas de changement pour ${kasperskyData.Nom}`);
          }
        }
      }
    }

    // -------- Cas GLPI --------
    for (const glpiData of allGlpiData) {
      if (!glpiData.Nom || adCNs.has(glpiData.Nom) || processed.has(glpiData.Nom)) continue;
      processed.add(glpiData.Nom);

      const noADData = {
        ..._.omit(glpiData.toObject(), ["_id", "__v"]),
        Composites: ["GLPI"]
      };

      // Initialisation sûre
      noADData.dangerousityNumber = noADData.dangerousityNumber || 0;
      noADData.ConformitiesChecked = noADData.ConformitiesChecked || [];

      noADData.ConformitiesChecked = _.union(
        noADData.ConformitiesChecked,
        [`${nomConformiteAD}(${dangerousityNumberAD})`],
        [`${nomConformiteKaspersky}(${dangerousityNumberKaspersky})`]
      );

      noADData.dangerousityNumber += dangerousityNumberAD + dangerousityNumberKaspersky;

      const existing = await NoAD.findOne({ Nom: glpiData.Nom });

      if (!existing) {
        await NoAD.create(noADData);
        console.log(`🆕 Ajout noAD pour ${glpiData.Nom}`);
      } else {
        noADData.ConformitiesChecked = _.union(
          existing.ConformitiesChecked || [],
          noADData.ConformitiesChecked
        );

        noADData.dangerousityNumber = noADData.ConformitiesChecked.reduce((acc, item) => {
          const match = item.match(/\((\d+)\)$/);
          return acc + (match ? parseInt(match[1], 10) : 0);
        }, 0);

        const cleanExisting = _.pick(existing.toObject(), relevantFields);
        const cleanNew = _.pick(noADData, relevantFields);
        const hasChanged = !_.isEqual(cleanExisting, cleanNew);

        if (hasChanged) {
          await NoAD.findOneAndUpdate({ Nom: glpiData.Nom }, noADData, { new: true });
          console.log(`🔄 Mise à jour noAD pour ${glpiData.Nom}`);
        } else {
          console.log(`✅ Pas de changement pour ${glpiData.Nom}`);
        }
      }
    }

    console.log("✅ Fusion noAD terminée avec succès pour tous les ordinateurs.");
  } catch (error) {
    console.error("❌ Erreur dans l'ajout ou la fusion noAD :", error);
  }
}

module.exports = noAD;
