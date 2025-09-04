const fs = require('fs');
const csv = require('csv-parser');
const kasperskyData = require('../models/kaspersky.model');
const path = require('path');
const logHistory = require('../utility_function/loggers/logHistory');
const _ = require("lodash");
const chemin = process.env.CHEMIN_ACCES_FICHIER_CSV;

// Fonction pour détecter automatiquement le séparateur CSV
function detectSeparator(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Fichier CSV introuvable : ${filePath}`);
      return ','; // Retourne un séparateur par défaut
    }

    const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
    const separators = [',', ';', '\t', '|'];
    let maxCount = 0;
    let detected = ',';

    separators.forEach(sep => {
      const count = firstLine.split(sep).length;
      if (count > maxCount) {
        maxCount = count;
        detected = sep;
      }
    });

    return detected;
  } catch (err) {
    console.log(`⚠ Impossible de détecter le séparateur : ${err.message}`);
    return ','; // Valeur par défaut pour continuer
  }
}


// Fonction d'importation
function importKaspersky() {
  return new Promise((resolve, reject) => {
    const allKasperskyData = [];
    const nomSet = new Set(); // Set local pour éviter doublons pendant l'import
    const kasperskyCSVRessourcePath = chemin;
    let user = "System";

    let stream;
    try {
      stream = fs.createReadStream(kasperskyCSVRessourcePath);
    } catch (err) {
      console.log(`⚠ Fichier Kaspersky inaccessible : ${err.message}`);
      return resolve(); // Terminer proprement sans planter
    }

    const separator = detectSeparator(kasperskyCSVRessourcePath);
    console.log("Séparateur détecté :", separator);

    stream
      .on('error', (err) => {
        console.log(`⚠ Impossible de lire le fichier Kaspersky : ${err.message}`);
        return resolve(); 
      })
      .pipe(csv({ separator }))
      .on('data', (ligne) => {
        // Nettoyage des clés et valeurs pour éviter les espaces
        const cleanLigne = {};
        for (let key in ligne) {
          cleanLigne[key.trim()] = ligne[key]?.trim();
        }

        const newKasperskyData = new kasperskyData({
          Nom: cleanLigne.Nom,
          agentAdministrationInstale: cleanLigne["L'Agent d'administration est installé"]?.toLowerCase(),
          agentAdministrationExecution: cleanLigne["L'Agent d'administration est en cours d'exécution"]?.toLowerCase(),
          protectionTempsReel: cleanLigne["Protection en temps réel"]?.toLowerCase(),
          DerniereMiseAJourBasesAntivirus: cleanLigne["Dernière mise à jour des bases antivirus"] || null,
          etat: cleanLigne["État"] || null,
          description: cleanLigne["Description de l'état"] || null,
          groupeParent: cleanLigne["Groupe parent"] || null,
          etatChiffrement: cleanLigne["État de chiffrement"] || null,
          DerniereAnalyseComplete: cleanLigne["Dernière analyse complète"]
            ? new Date(cleanLigne["Dernière analyse complète"])
            : null,
        });

        if (nomSet.has(newKasperskyData.Nom)) {
          console.log(`L'ordinateur ${newKasperskyData.Nom} existe déjà dans le fichier CSV (doublon ignoré).`);
          return;
        }

        nomSet.add(newKasperskyData.Nom);
        allKasperskyData.push(newKasperskyData);
      })
      .on('end', async () => {
        try {
          let updatesCount = 0;

          for (const doc of allKasperskyData) {
            try {
              const updateDoc = doc.toObject();
              delete updateDoc._id;
              delete updateDoc.__v;

              const existing = await kasperskyData.findOne({ Nom: updateDoc.Nom });

              if (!existing) {
                await kasperskyData.updateOne({ Nom: updateDoc.Nom }, { $set: updateDoc }, { upsert: true });
                updatesCount++;
              } else {
                const ignoreFields = ["__v", "createdAt", "updatedAt", "_id"];
                const cleanExisting = _.omit(existing.toObject(), ignoreFields);
                const cleanNew = _.omit(updateDoc, ignoreFields);

                if (!_.isEqual(cleanExisting, cleanNew)) {
                  await kasperskyData.updateOne({ Nom: updateDoc.Nom }, { $set: updateDoc });
                  updatesCount++;
                }
              }
            } catch (err) {
              console.error(`❌ Erreur lors de l'upsert du poste Kaspersky ${doc.Nom} :`, err.message);
            }
          }

          logHistory(`✅ ${updatesCount} postes Kaspersky insérés ou mis à jour avec succès depuis Kaspersky.`, user);
          console.log(`✅ ${updatesCount} postes Kaspersky insérés ou mis à jour avec succès depuis Kaspersky.`);
          resolve();
        } catch (err) {
          logHistory("❌ Echec de l'importation des donnees depuis Kaspersky", user);
          console.error("❌Erreur lors de l'insertion des données de Kaspersky :", err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}

module.exports = importKaspersky;
