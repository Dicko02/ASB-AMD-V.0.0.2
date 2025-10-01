const AD = require('../models/ad.model');
const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const Fusion = require('../models/fusion.model');
const _ = require("lodash");

const conformityDangerosityNumberModel = require('../models/conformityDangerosityNumber.model');

const relevantFields = [
  "CN",
  "Nom",
  "DNSHostName",
  "LastLogonDate",
  "OperatingSystem",
  "OperatingSystemVersion",
  "whenCreated",
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

async function fusion() {
  try {
    const allAdData = await AD.find();
    const allGlpiData = await GLPI.find();
    const allKasperskyData = await Kaspersky.find();

    const nomConformiteAD = "La machine n'existe pas dans AD";
    const nomConformiteKaspersky = "La machine n'existe pas dans Kaspersky";
    const nomConformiteGlpi = "La machine n'apparait pas dans GLPI";

    const dangerosityParams = await conformityDangerosityNumberModel.findOne(); // Récupérer les paramètres de dangerosité

    const dangerousityNumberAD = dangerosityParams?.NoAD ?? 10;
    const dangerousityNumberKaspersky = dangerosityParams?.NoKaspersky ?? 10;
    const dangerousityNumberGlpi = dangerosityParams?.NoGLPI ?? 10;

    const processed = new Set(); // pour éviter les doublons

    // machines AD
    for (const adData of allAdData) {
      const adName = adData.CN;
      const glpiData = allGlpiData.find(glpi => glpi.Nom === adName);
      const kasperskyData = allKasperskyData.find(kaspersky => kaspersky.Nom === adName);

      const fusionData = {
        ...adData.toObject(),
        ...(glpiData ? glpiData.toObject() : {}),
        ...(kasperskyData ? kasperskyData.toObject() : {}),
      };

      fusionData.dangerousityNumber = 0;
      const composites = ["AD"];
      fusionData.ConformitiesChecked = fusionData.ConformitiesChecked || [];

      if (!glpiData) {
        fusionData.dangerousityNumber += dangerousityNumberGlpi;
        fusionData.ConformitiesChecked.push(`${nomConformiteGlpi}(${dangerousityNumberGlpi})`);
      } else {
        composites.push("GLPI");
      }

      if (!kasperskyData) {
        fusionData.dangerousityNumber += dangerousityNumberKaspersky;
        fusionData.ConformitiesChecked.push(`${nomConformiteKaspersky}(${dangerousityNumberKaspersky})`);
      } else {
        composites.push("Kaspersky");
      }

      fusionData.Composites = composites;
      processed.add(adData.CN);

      const existing = await Fusion.findOne({ CN: adData.CN });

      fusionData.ConformitiesChecked = _.union(
        existing?.ConformitiesChecked || [],
        fusionData.ConformitiesChecked
      );

      fusionData.dangerousityNumber = fusionData.ConformitiesChecked.reduce((acc, item) => {
        const match = item.match(/\((\d+)\)$/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);

      if (!existing) {
        await Fusion.create(fusionData);
        console.log(`🆕 Ajout Fusion pour ${adData.CN}`);
      } else {
        const cleanExisting = _.pick(existing.toObject(), relevantFields);
        const cleanFusion = _.pick(fusionData, relevantFields);
        const hasChanged = !_.isEqual(cleanExisting, cleanFusion);

        if (hasChanged) {
          const updateData = _.omit(fusionData, ['_id', '__v']);
          await Fusion.findOneAndUpdate({ CN: adData.CN }, { $set: updateData }, { new: true });
          console.log(`🔄 Mise à jour Fusion pour ${adData.CN}`);
        } else {
          console.log(`✅ Pas de changement pour ${adData.CN}`);
        }
      }
    }


    // Cas Kaspersky
    for (const kasperskyData of allKasperskyData) {
      if (!kasperskyData.Nom || processed.has(kasperskyData.Nom)) continue;

      const glpiData = allGlpiData.find(glpi => glpi.Nom === kasperskyData.Nom);

      const fusionData = {
        ..._.omit(kasperskyData.toObject(), ["_id", "__v"]),
        ...(glpiData ? _.omit(glpiData.toObject(), ["_id", "__v"]) : {}),
      };

      fusionData.dangerousityNumber = fusionData.dangerousityNumber || 0;
      fusionData.ConformitiesChecked = fusionData.ConformitiesChecked || [];
      fusionData.Composites = ["Kaspersky"];

      fusionData.ConformitiesChecked = _.union(
        fusionData.ConformitiesChecked,
        [`${nomConformiteAD}(${dangerousityNumberAD})`]
      );
      fusionData.dangerousityNumber += dangerousityNumberAD;

      if (!glpiData) {
        fusionData.ConformitiesChecked = _.union(
          fusionData.ConformitiesChecked,
          [`${nomConformiteGlpi}(${dangerousityNumberGlpi})`]
        );
        fusionData.dangerousityNumber += dangerousityNumberGlpi;
      } else {
        fusionData.Composites.push("GLPI");
      }

      processed.add(kasperskyData.Nom);

      const existing = await Fusion.findOne({ Nom: kasperskyData.Nom });

      fusionData.ConformitiesChecked = _.union(
        existing?.ConformitiesChecked || [],
        fusionData.ConformitiesChecked
      );

      fusionData.dangerousityNumber = fusionData.ConformitiesChecked.reduce((acc, item) => {
        const match = item.match(/\((\d+)\)$/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);

      if (!existing) {
        await Fusion.create(fusionData);
        console.log(`🆕 Ajout Fusion pour ${kasperskyData.Nom}`);
      } else {
        const cleanExisting = _.pick(existing.toObject(), relevantFields);
        const cleanFusion = _.pick(fusionData, relevantFields);
        const hasChanged = !_.isEqual(cleanExisting, cleanFusion);

        if (hasChanged) {
          await Fusion.findOneAndUpdate({ Nom: kasperskyData.Nom }, fusionData, { new: true });
          console.log(`🔄 Mise à jour Fusion pour ${kasperskyData.Nom}`);
        } else {
          console.log(`✅ Pas de changement pour ${kasperskyData.Nom}`);
        }
      }
    }

    // Cas GLPI
    for (const glpiData of allGlpiData) {
      if (!glpiData.Nom || processed.has(glpiData.Nom)) continue;

      const fusionData = {
        ..._.omit(glpiData.toObject(), ["_id", "__v"]),
        Composites: ["GLPI"]
      };

      fusionData.dangerousityNumber = fusionData.dangerousityNumber || 0;
      fusionData.ConformitiesChecked = fusionData.ConformitiesChecked || [];

      fusionData.ConformitiesChecked = _.union(
        fusionData.ConformitiesChecked,
        [`${nomConformiteAD}(${dangerousityNumberAD})`],
        [`${nomConformiteKaspersky}(${dangerousityNumberKaspersky})`]
      );

      fusionData.dangerousityNumber += dangerousityNumberAD + dangerousityNumberKaspersky;

      processed.add(glpiData.Nom);

      const existing = await Fusion.findOne({ Nom: glpiData.Nom });

      fusionData.ConformitiesChecked = _.union(
        existing?.ConformitiesChecked || [],
        fusionData.ConformitiesChecked
      );

      fusionData.dangerousityNumber = fusionData.ConformitiesChecked.reduce((acc, item) => {
        const match = item.match(/\((\d+)\)$/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);

      if (!existing) {
        await Fusion.create(fusionData);
        console.log(`🆕 Ajout Fusion pour ${glpiData.Nom}`);
      } else {
        const cleanExisting = _.pick(existing.toObject(), relevantFields);
        const cleanFusion = _.pick(fusionData, relevantFields);
        const hasChanged = !_.isEqual(cleanExisting, cleanFusion);

        if (hasChanged) {
          await Fusion.findOneAndUpdate({ Nom: glpiData.Nom }, fusionData, { new: true });
          console.log(`🔄 Mise à jour Fusion pour ${glpiData.Nom}`);
        } else {
          console.log(`✅ Pas de changement pour ${glpiData.Nom}`);
        }
      }
    }

    console.log("✅ Fusion terminée avec succès pour tous les ordinateurs.");
  } catch (error) {
    console.error("❌ Erreur dans la fusion :", error);
  }
}

module.exports = fusion;
