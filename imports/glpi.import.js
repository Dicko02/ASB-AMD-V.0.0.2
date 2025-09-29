const fetch = require('node-fetch');
const glpiData = require('../models/glpi.model');
const logHistory = require('../utility_function/loggers/logHistory');
const _ = require("lodash");

// Configuration
const GLPI_URL = process.env.GLPI_URL;
const USER_TOKEN = process.env.GLPI_USER_TOKEN;
const APP_TOKEN = process.env.GLPI_APP_TOKEN;

// Fonction utilitaire safeFetch pour éviter les plantages
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(`⚠️ Requête échouée (${res.status}) sur ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.log(`⚠️ Erreur réseau sur ${url} : ${err.message}`);
    return null;
  }
}

// Fonction pour initialiser la session GLPI
async function initGlpiSession() {
  try {
    const data = await safeFetch(`${GLPI_URL}/initSession`, {
      headers: {
        'App-Token': APP_TOKEN,
        'Authorization': `user_token ${USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!data?.session_token) {
      console.log(`❌ Impossible d'ouvrir une session GLPI sur ${GLPI_URL}`);
      return null;
    }

    return data.session_token;

  } catch (err) {
    console.error(`❌ Erreur critique lors de l'init GLPI : ${err.message}`);
    return null;
  }
}

// Pour récupérer les ordinateurs dans GLPI
async function fetchGlpiComputers(sessionToken, rangeStart = 0, rangeStop = 499) {
  const res = await safeFetch(`${GLPI_URL}/Computer`, {
    headers: {
      'Session-Token': sessionToken,
      'App-Token': APP_TOKEN,
      'Range': `${rangeStart}-${rangeStop}`
    }
  });

  if (!Array.isArray(res)) {
    return { data: [], more: false };
  }

  const more = res.length >= (rangeStop - rangeStart + 1);

  return { data: res, more };
}

// Pour récupérer les détails d'un ordinateur par son id
async function fetchComputerDetails(id, sessionToken) {
  return await safeFetch(`${GLPI_URL}/Computer/${id}?expand_dropdowns=true`, {
    headers: {
      'Session-Token': sessionToken,
      'App-Token': APP_TOKEN
    }
  }) || {};
}

// Pour fermer une session GLPI
async function closeGlpiSession(sessionToken) {
  try {
    await safeFetch(`${GLPI_URL}/killSession`, {
      headers: {
        'Session-Token': sessionToken,
        'App-Token': APP_TOKEN
      }
    });
    console.log("✅ Session GLPI fermée");
  } catch (err) {
    console.error("❌ Erreur dans closeGlpiSession:", err.message);
  }
}

// Pour importer les données GLPI depuis l'API(l'ensemble de toutes les fonctions précédentes)
async function importGlpiFromApi() {
  let user = "System";
  
  try {
    const sessionToken = await initGlpiSession();
    if (!sessionToken) {
      console.log('❌ Échec de l’ouverture de session GLPI.');
      return;
    }

    let rangeStart = 0;
    const step = 500; // pagination souple
    let updatesCount = 0;
    const concurrencyLimit = 10;

    // Boucle principale de la récupération des infos des machines
    while (true) {
      const { data: computers, more } = await fetchGlpiComputers(
        sessionToken,
        rangeStart,
        rangeStart + step - 1
      );

      if (!Array.isArray(computers) || computers.length === 0) break;

      // Fonction avec enrichissement et sauvegarde Mongo
      const processEntry = async (entry) => {
        try {
          // Enrichissement : disques & antivirus depuis détails
          const details = await fetchComputerDetails(entry.id, sessionToken);

          const volumes = details?.ComputerDisk ?? [];
          const total = volumes.reduce((s, d) => s + (d.totalsize || 0), 0);
          const free = volumes.reduce((s, d) => s + (d.freesize || 0), 0);
          const pctFree = total ? Math.round((free / total) * 100) : null;

          const softwares = details?.SoftwareVersion ?? [];
          const av = softwares.find(s => /kaspersky|avast|eset|bitdefender/i.test(s.name || ''));

          const osName = details.operatingsystems_id?.name || null;
          const ip = details.NetworkPort?.[0]?.ipaddresses?.[0]?.name || null;

          const doc = {
            Nom: entry.name || null,
            Lieu: entry.locations_id || null,
            VolumesPourcentageLibre: pctFree,
            AntivirusNom: av?.name || null,
            AntivirusActif: av ? true : null,
            AntivirusVersion: av?.version || null,
            Utilisateur: entry.users_id_tech || null,
            ExploitationSystem: osName,
            IP: ip
          };

          // Vérifier si l'ordinateur existe déjà
          const existing = await glpiData.findOne({ Nom: doc.Nom });

          if (!existing) {

            // Si pas trouvé on fait une insertion
            await glpiData.updateOne({ Nom: doc.Nom }, { $set: doc }, { upsert: true });
            updatesCount++;
          } else {

            const ignoreFields = ["__v", "createdAt", "updatedAt", "_id"];// Champs à ignorer
            // Nettoyage des champs à ignorer
            const cleanExisting = _.omit(existing.toObject(), ignoreFields);
            const cleanNew = _.omit(doc, ignoreFields);
          
            const hasChanged = !_.isEqual(cleanExisting, cleanNew);// Vérification du changement ou non des données

            // Si des changements ont été détectés on fait une mise à jour
            if (hasChanged) {
              await glpiData.updateOne({ Nom: doc.Nom }, { $set: doc });
              updatesCount++;
            }
          }

        } catch (e) {
          console.log(`⚠️  Erreur sur l’entrée GLPI ${entry.name} :`, e.message);
        }
      };

      // Traitement en parallèle par lots de 10 (Limitage du nombre de requêtes simultanées)
      for (let i = 0; i < computers.length; i += concurrencyLimit) {
        const chunk = computers.slice(i, i + concurrencyLimit);
        await Promise.all(chunk.map(processEntry));
      }

      if (!more) break; // pas d’autre page
      rangeStart += step;
    }

    await closeGlpiSession(sessionToken);

    logHistory(`✅ ${updatesCount} ordinateurs importés ou mis à jour depuis GLPI.`, user);
    console.log(`✅ ${updatesCount} ordinateurs importés ou mis à jour depuis GLPI.`);
  } catch (err) {
    logHistory("❌ Echec de l'importation des données depuis GLPI", user);
    console.log('❌ Erreur pendant l’import des données GLPI :', err.message);
  }
}

module.exports = importGlpiFromApi;
