const fs = require("fs");
const parseAppLogLine = require("./parseAppLogLine")

// Fonction principale pour analyser les logs
function analyserLogsApp(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error("Erreur de lecture du fichier :", err.message);
    return [];
  }

  const lignes = content.split("\n").filter(l => l.trim() !== "");
  const entries = lignes.map(parseAppLogLine).filter(Boolean);

  const history = new Map();

  for (const { datetime, endpoint, level } of entries) {
    if (!history.has(endpoint)) {
      history.set(endpoint, []);
    }
    history.get(endpoint).push({ datetime, level });
  }

  const critiquesDurables = [];

  for (const [endpoint, logs] of history.entries()) {
    logs.sort((a, b) => a.datetime - b.datetime);

    let start = null;
    let niveauActuel = null;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const suivant = logs[i + 1];

      if (!start) {
        // Début d'une période
        start = log.datetime;
        niveauActuel = log.level;
      }

      if (!suivant || suivant.level !== niveauActuel) {
        // Fin de période si niveau change ou fin de liste
        const end = log.datetime;
        const dureeMs = end - start;
        const jours = dureeMs / (1000 * 60 * 60 * 24);

        if (jours >= 1) {
          critiquesDurables.push({
            endpoint,
            niveau: niveauActuel,
            depuis: start.toISOString(),
            jusqua: end.toISOString(),
            jours: jours.toFixed(2),
          });
        }

        // Réinitialiser
        start = null;
        niveauActuel = null;
      }
    }
  }

  return critiquesDurables;
}

module.exports = analyserLogsApp;
