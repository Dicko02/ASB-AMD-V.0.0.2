const fs = require('fs');
const csv = require('csv-parser');
const kasperskyData = require('../models/kaspersky.model');
const path = require('path');

//Fonction d'importation
function importKaspersky() {
  return new Promise((resolve, reject) => {
    const allKasperskyData = [];
    const nomSet = new Set(); //Set local pour éviter doublons pendant l'import
    const kasperskyCSVRessourcePath = path.join('\\\\WIN-K0J5FFPIPLB', 'KSC-Share', 'allKasperskyData.csv');

    let stream;
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
          agentAdministrationInstalle: ligne["L'Agent d'administration est installé"]?.toLowerCase(),
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
          const existingDocs = await kasperskyData.find({ Nom: { $in: allKasperskyData.map(d => d.Nom) } }).select('Nom');
          const existingNoms = new Set(existingDocs.map(d => d.Nom));
          const filteredData = allKasperskyData.filter(d => !existingNoms.has(d.Nom));

          if (filteredData.length === 0) {
            console.log("⚠️ Aucun nouvel ordinateur à insérer depuis Kaspersky, tous les Nom existent déjà.");
            return resolve();
          }

          let updatesCount = 0;
          for (const doc of allKasperskyData) {
            try {

              const updateDoc = doc.toObject();
              delete updateDoc._id; // Suppression de _id
              delete updateDoc.__v; // Suppression de __v

              await kasperskyData.updateOne(
                { Nom: doc.Nom }, //Critère : identifiant unique du poste
                { $set: updateDoc }, //On remplace les données existantes
                { upsert: true } //Sinon, on insère
              );
              updatesCount++;
            } catch (err) {
              console.error(`❌ Erreur lors de l'upsert du poste Kaspersky ${doc.Nom} :`, err.message);
            }
          }

          console.log(`✅ ${updatesCount} postes Kaspersky insérés ou mis à jour avec succès !`);
          resolve();

        } catch (err) {
          console.error("❌Erreur lors de l'insertion des données de Kaspersky :", err);
          reject(err);
        }

      })
      .on('error', reject);
  });
}

module.exports = importKaspersky;
