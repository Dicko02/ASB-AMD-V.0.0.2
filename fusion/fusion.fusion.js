const AD = require('../models/ad.model');
const GLPI = require('../models/glpi.model');
const Kaspersky = require('../models/kaspersky.model');
const Fusion = require('../models/fusion.model');
const _ = require("lodash"); // pour les comparaisons profonde

const conformityDangerosityNumberModel = require('../models/conformityDangerosityNumber.model'); // Pour récupérer les paramètres de dangerosité


// Champs pertinents pour la comparaison
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
    const [allAdData, allGlpiData, allKasperskyData, dangerosityParams] = await Promise.all([
      AD.find(), GLPI.find(), Kaspersky.find(), conformityDangerosityNumberModel.findOne()
    ]);

    const dangerousityNumbers = {
      AD: dangerosityParams?.NoAD ?? 10,
      Kaspersky: dangerosityParams?.NoKaspersky ?? 10,
      GLPI: dangerosityParams?.NoGLPI ?? 10
    };

    const adMap = new Map(allAdData.map(d => [d.CN, d]));
    const glpiMap = new Map(allGlpiData.map(d => [d.Nom, d]));
    const kasperskyMap = new Map(allKasperskyData.map(d => [d.Nom, d]));
    const fusionMap = new Map((await Fusion.find()).map(d => [d.CN || d.Nom, d]));

    const allKeys = new Set([...adMap.keys(), ...glpiMap.keys(), ...kasperskyMap.keys()]);

    const operations = [];

    for (const key of allKeys) {
      const adData = adMap.get(key);
      const glpiData = glpiMap.get(key);
      const kasperskyData = kasperskyMap.get(key);
      const existing = fusionMap.get(key);

      const fusionData = {
        ...(adData?.toObject() || {}),
        ...(glpiData?.toObject() || {}),
        ...(kasperskyData?.toObject() || {}),
        ConformitiesChecked: [],
        Composites: []
      };

      // Supprimer les champs MongoDB immuables
      delete fusionData._id;
      delete fusionData.__v;

      // Calcul des composites
      if (adData) fusionData.Composites.push("AD");
      if (glpiData) fusionData.Composites.push("GLPI");
      if (kasperskyData) fusionData.Composites.push("Kaspersky");

      // ConformitiesChecked et dangerousityNumber
      if (!adData) fusionData.ConformitiesChecked.push(`La machine n'existe pas dans AD(${dangerousityNumbers.AD})`);
      if (!glpiData) fusionData.ConformitiesChecked.push(`La machine n'apparait pas dans GLPI(${dangerousityNumbers.GLPI})`);
      if (!kasperskyData) fusionData.ConformitiesChecked.push(`La machine n'existe pas dans Kaspersky(${dangerousityNumbers.Kaspersky})`);

      fusionData.dangerousityNumber = fusionData.ConformitiesChecked.reduce((acc, item) => {
        const match = item.match(/\((\d+)\)$/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);

      const cleanFusion = _.pick(fusionData, relevantFields);
      const cleanExisting = existing ? _.pick(existing.toObject(), relevantFields) : null;

      if (!existing) {
        operations.push({ insertOne: { document: fusionData } });
      } else if (!_.isEqual(cleanFusion, cleanExisting)) {
        const updateData = { ...fusionData };
        delete updateData._id; // Juste pour être sûr
        operations.push({ updateOne: { filter: { CN: key }, update: { $set: updateData } } });
      }
    }

    if (operations.length > 0) {
      await Fusion.bulkWrite(operations);
    }

    console.log("✅ Fusion optimisée terminée pour toutes les machines.");
  } catch (err) {
    console.error("❌ Erreur fusion optimisée :", err);
  }
}


module.exports = fusion;
