const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const NoAD = require('../models/noAD.model');
const AD = require('../models/ad.model');  // Import du modèle AD
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

// fonction permettant la fusion des endpoints apparaissant dans Kaspersky ou GLPI mais n'apparaissant pas dans AD
async function noAD() {
  try {
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();
    const allAdData = await AD.find();

    // Crée un Set avec tous les CN d'AD pour vérifier rapidement
    const adCNs = new Set(allAdData.map(ad => ad.CN));
    const processed = new Set(); // pour éviter les doublons

    // ---- Cas Kaspersky ----
    if (allKasperskyData && allKasperskyData.length > 0) {
      for (const kasperskyData of allKasperskyData) {

        // Ignore si Nom dans Kaspersky est absent ou déjà traité
        if (!kasperskyData.Nom || adCNs.has(kasperskyData.Nom) || processed.has(kasperskyData.Nom)) continue;
        processed.add(kasperskyData.Nom);

        const glpiData = allGlpiData.find(glpi => glpi.Nom === kasperskyData.Nom);

        const noADData = {
          ...kasperskyData.toObject(),
          ...(glpiData ? glpiData.toObject() : {}),
        };

        // Préparer le tableau Composites selon la source
        const composites = ["Kaspersky"];
        if (glpiData) composites.push("GLPI");
        noADData.Composites = composites;

        // Vérifie si déjà existant
        const existing = await NoAD.findOne({ Nom: kasperskyData.Nom });

        if (!existing) {
          await NoAD.create(noADData);
          console.log(`🆕 Ajout noAD pour ${kasperskyData.Nom}`);
        } else {

          // Fusionner les tableaux ConformitiesChecked pour ne pas perdre les anciennes erreurs
          noADData.ConformitiesChecked = _.union(
            existing?.ConformitiesChecked || [],
            noADData.ConformitiesChecked || []
          );

          // Recalculer dangerousityNumber
          noADData.dangerousityNumber = noADData.ConformitiesChecked.reduce((acc, item) => {
            const match = item.match(/\((\d+)\)$/);
            return acc + (match ? parseInt(match[1], 10) : 0);
          }, 0);

          // Comparaison seulement sur les champs pertinents
          const cleanExisting = _.pick(existing.toObject(), relevantFields);
          const cleanNew = _.pick(noADData, relevantFields);
          const hasChanged = !_.isEqual(cleanExisting, cleanNew);

          if (hasChanged) {
            await NoAD.findOneAndUpdate(
              { Nom: kasperskyData.Nom },
              noADData,
              { new: true }
            );
            console.log(`🔄 Mise à jour noAD pour ${kasperskyData.Nom}`);
          } else {
            console.log(`✅ Pas de changement pour ${kasperskyData.Nom}`);
          }
        }
      }
    }

    // ---- Cas GLPI ----
    for (const glpiData of allGlpiData) {
      if (!glpiData.Nom || adCNs.has(glpiData.Nom) || processed.has(glpiData.Nom)) continue;
      processed.add(glpiData.Nom);

      const noADData = {
        ...glpiData.toObject(),
        Composites: ["GLPI"]
      };

      const existing = await NoAD.findOne({ Nom: glpiData.Nom });

      if (!existing) {
        await NoAD.create(noADData);
        console.log(`🆕 Ajout noAD pour ${glpiData.Nom}`);
      } else {
        // Fusionner ConformitiesChecked
        noADData.ConformitiesChecked = _.union(
          existing?.ConformitiesChecked || [],
          noADData.ConformitiesChecked || []
        );

        // Recalculer dangerousityNumber
        noADData.dangerousityNumber = noADData.ConformitiesChecked.reduce((acc, item) => {
          const match = item.match(/\((\d+)\)$/);
          return acc + (match ? parseInt(match[1], 10) : 0);
        }, 0);

        const cleanExisting = _.pick(existing.toObject(), relevantFields);
        const cleanNew = _.pick(noADData, relevantFields);
        const hasChanged = !_.isEqual(cleanExisting, cleanNew);

        if (hasChanged) {
          await NoAD.findOneAndUpdate(
            { Nom: glpiData.Nom },
            noADData,
            { new: true }
          );
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
};

module.exports = noAD;
