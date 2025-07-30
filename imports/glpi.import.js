const fetch = require('node-fetch');
const glpiData = require('../models/glpi.model');
require('dotenv').config();

// Configuration
const GLPI_URL = process.env.GLPI_URL
const USER_TOKEN = process.env.GLPI_USER_TOKEN
const APP_TOKEN = process.env.GLPI_APP_TOKEN

async function initGlpiSession() {
  const res = await fetch(`${GLPI_URL}/initSession`, {
    headers: {
      'App-Token': APP_TOKEN,
      'Authorization': `user_token ${USER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  return data.session_token || null;
}

async function fetchGlpiComputers(sessionToken, rangeStart = 0, rangeStop = 999) {
  const res = await fetch(`${GLPI_URL}/Computer`, {
    headers: {
      'Session-Token': sessionToken,
      'App-Token': APP_TOKEN,
      'Range': `${rangeStart}-${rangeStop}`
    }
  });
  const data = await res.json();
  const more = res.headers.get('Content-Range')?.includes('*'); // GLPI renvoie * si + de résultats
  return { data, more };
}

// enrichissement
async function fetchComputerDetails(id, sessionToken) {
  const res = await fetch(`${GLPI_URL}/Computer/${id}?expand_dropdowns=true`, {
    headers: {
      'Session-Token': sessionToken,
      'App-Token': APP_TOKEN
    }
  });
  return res.json();
}

async function closeGlpiSession(sessionToken) {
  await fetch(`${GLPI_URL}/killSession`, {
    headers: {
      'Session-Token': sessionToken,
      'App-Token': APP_TOKEN
    }
  });
}

async function importGlpiFromApi() {
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

          const doc = {
            Nom: entry.name || null,
            Lieu: entry.locations_id || null,
            VolumesPourcentageLibre: pctFree,
            AntivirusNom: av?.name || null,
            AntivirusActif: av ? true : null,
            AntivirusVersion: av?.version || null,
            Utilisateur: entry.users_id_tech || null
          };

          await glpiData.updateOne({ Nom: doc.Nom }, { $set: doc }, { upsert: true });
          updatesCount++;
        } catch (e) {
          console.log(`⚠️  Erreur sur l’entrée GLPI ${entry.name} :`, e.message);
        }
      };

      // Traitement en parallèle par lots de 10
      for (let i = 0; i < computers.length; i += concurrencyLimit) {
        const chunk = computers.slice(i, i + concurrencyLimit);
        await Promise.all(chunk.map(processEntry));
      }

      if (!more) break; // pas d’autre page
      rangeStart += step;
    }

    await closeGlpiSession(sessionToken);
    console.log(`✅ ${updatesCount} ordinateurs importés ou mis à jour avec succès.`);
  } catch (err) {
    console.log('❌ Erreur pendant l’import des données GLPI :', err);
  }
}

module.exports = importGlpiFromApi;
