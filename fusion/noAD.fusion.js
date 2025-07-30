const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const NoAD = require('../models/noAD.model');
const AD = require('../models/ad.model');  // Import du modèle AD

// fonction permettant la fusion des endpoints apparraissant dans Kaspersky ou GLPI mais n'apparaissant pas dans AD
async function noAD() {

  try {
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();
    const allAdData = await AD.find();

    // Crée un Set avec tous les CN d'AD pour vérifier rapidement
    const adCNs = new Set(allAdData.map(ad => ad.CN));

    if (allKasperskyData && allKasperskyData.length > 0) {
      for (const kasperskyData of allKasperskyData) {
        // Ignore si Nom dans Kaspersky est présent comme CN dans AD
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

        // Pour éviter les mises à jour inutiles
        const existing = await NoAD.findOne({ Nom: kasperskyData.Nom });

        if (!existing || JSON.stringify(existing.toObject()) !== JSON.stringify({ ...existing.toObject(), ...noADData })) {
          await NoAD.findOneAndUpdate(
            { Nom: kasperskyData.Nom },  // filtre
            noADData,        // données fusionnées
            { upsert: true, new: true } // options : crée si pas existant, retourne le doc modifié
          );

          console.log("✅ Fusion noAD mise à jour/ajoutée pour l'ordinateur " + kasperskyData.Nom);
        }
      }

    } else {
      for (const glpiData of allGlpiData) {
        // Ignore si Nom dans GLPI est présent comme CN dans AD
        if (adCNs.has(glpiData.Nom)) continue;

        const noADData = {
          ...glpiData.toObject(),
          Composites: ["GLPI"]
        };

        // Pour éviter les mises à jour inutiles
        const existing = await NoAD.findOne({ Nom: glpiData.Nom });

        if (!existing || JSON.stringify(existing.toObject()) !== JSON.stringify({ ...existing.toObject(), ...noADData })) {
          await NoAD.findOneAndUpdate(
            { Nom: glpiData.Nom },  // filtre
            noADData,        // données fusionnées
            { upsert: true, new: true } // options : crée si pas existant, retourne le doc modifié
          );
        }

        console.log("✅ Fusion noAD mise à jour/ajoutée pour l'ordinateur " + glpiData.Nom);
      }
    }

    console.log("✅ Fusion noAD terminée avec succès pour tous les ordinateurs.");

  } catch (error) {
    console.error("❌ Erreur dans l'ajout ou la fusion noAD :", error);
  }
};

module.exports = noAD;
