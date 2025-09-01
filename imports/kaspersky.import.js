const fs = require('fs');
const csv = require('csv-parser');
const kasperskyData = require('../models/kaspersky.model');
const path = require('path');
const logHistory = require('../utility_function/loggers/logHistory');
const _ = require("lodash");
const chemin = process.env.CHEMIN_ACCES_FICHIER_CSV;

//Fonction d'importation
function importKaspersky() {
  return new Promise((resolve, reject) => {
    const allKasperskyData = [];
    const nomSet = new Set(); //Set local pour éviter doublons pendant l'import

    const kasperskyCSVRessourcePath = chemin;

    let stream;
    let user = "System";

    try {
      stream = fs.createReadStream(kasperskyCSVRessourcePath);
    } catch (err) {
      console.log(`⚠️ Fichier Kaspersky inaccessible : ${err.message}`);
      return resolve(); //On termine proprement sans planter
    }

    stream
      .on('error', (err) => {
        console.log(`⚠️ Impossible de lire le fichier Kaspersky : ${err.message}`);
        return resolve(); //Terminer silencieusement
      })
      .pipe(csv())
      .on('data', (ligne) => {
        const newKasperskyData = new kasperskyData({
          Nom: ligne?.Nom,
          agentAdministrationInstale: ligne["L'Agent d'administration est installé"]?.toLowerCase(),
          agentAdministrationExecution: ligne["L'Agent d'administration est en cours d'exécution"]?.toLowerCase(),
          protectionTempsReel: ligne["Protection en temps réel"]?.toLowerCase(),
          DerniereMiseAJourBasesAntivirus: ligne["Dernière mise à jour des bases antivirus"] || null,
          etat: ligne["État"] || null,
          description: ligne["Description de l'état"] || null,
          groupeParent: ligne["Groupe parent"] || null,
          etatChiffrement: ligne["État de chiffrement"] || null,
          DerniereAnalyseComplete: ligne["Dernière analyse complète"]
            ? new Date(ligne["Dernière analyse complète"])
            : null,
        });

        if (nomSet.has(newKasperskyData.Nom)) {
          console.log("L'ordinateur " + newKasperskyData.Nom + " existe déjà dans le fichier CSV (doublon ignoré).");
          return;
        } else {
          // Ajout de l'objet à la liste et au Set pour éviter les doublons
          nomSet.add(newKasperskyData.Nom);
          allKasperskyData.push(newKasperskyData);
        }

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
                // Comparaison champ par champ
                const ignoreFields = ["__v", "createdAt", "updatedAt", "_id"];// Champs à ignorer
                // Nettoyage des champs à ignorer
                const cleanExisting = _.omit(existing.toObject(), ignoreFields);
                const cleanNew = _.omit(doc, ignoreFields);
                
                const hasChanged = !_.isEqual(cleanExisting, cleanNew);// Vérification du changement ou non des données

                if (hasChanged) {
                  await kasperskyData.updateOne({ Nom: updateDoc.Nom }, { $set: updateDoc });
                  updatesCount++;
                }
              }
            } catch (err) {
              console.error(`❌ Erreur lors de l'upsert du poste Kaspersky ${doc.Nom} :`, err.message);
            }
          }

          logHistory(`✅ ${updatesCount} postes Kaspersky insérés ou mis à jour avec succès depuis Kasperky.`, user);
          console.log(`✅ ${updatesCount} postes Kaspersky insérés ou mis à jour avec succès depuis Kasperky.`);
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
