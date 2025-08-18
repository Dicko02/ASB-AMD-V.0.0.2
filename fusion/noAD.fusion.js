const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const NoAD = require('../models/noAD.model');
const AD = require('../models/ad.model');  // Import du modèle AD

// fonction permettant la fusion des endpoints apparaissant dans Kaspersky ou GLPI mais n'apparaissant pas dans AD
async function noAD() {
  try {
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();
    const allAdData = await AD.find();

    // Crée un Set avec tous les CN d'AD pour vérifier rapidement
    const adCNs = new Set(allAdData.map(ad => ad.CN));

    // ---- Cas Kaspersky ----
    if (allKasperskyData && allKasperskyData.length > 0) {
      for (const kasperskyData of allKasperskyData) {
        // Ignore si Nom dans Kaspersky est présent dans AD
        if (adCNs.has(kasperskyData.Nom)) continue;

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
          // Comparaison champ par champ
          const hasChanged = Object.keys(noADData).some(
            key => JSON.stringify(existing[key]) !== JSON.stringify(noADData[key])
          );

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

    // ---- Cas GLPI seul ----
    for (const glpiData of allGlpiData) {
      // Ignore si Nom dans GLPI est présent dans AD
      if (adCNs.has(glpiData.Nom)) continue;

      const noADData = {
        ...glpiData.toObject(),
        Composites: ["GLPI"]
      };

      const existing = await NoAD.findOne({ Nom: glpiData.Nom });

      if (!existing) {
        await NoAD.create(noADData);
        console.log(`🆕 Ajout noAD pour ${glpiData.Nom}`);
      } else {
        const hasChanged = Object.keys(noADData).some(
          key => JSON.stringify(existing[key]) !== JSON.stringify(noADData[key])
        );

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

    // ✅ Message final une seule fois
    console.log("🎉 Fusion noAD terminée avec succès pour tous les ordinateurs.");

  } catch (error) {
    console.error("❌ Erreur dans l'ajout ou la fusion noAD :", error);
  }
};

module.exports = noAD;
