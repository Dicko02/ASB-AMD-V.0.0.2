const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs'); // Chemin vers le dossier logs

// Vérification de l'existence du dossier logs
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Définir le chemin pour le fichier de logHistory
const historyLogFile = path.join(logsDir, 'history.log');

// Créer **une seule instance** du logger pour l’historique
const historyLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: historyLogFile,
      maxsize: 5 * 1024 * 1024, // max 5 MB
      maxFiles: 5,              // garde 5 fichiers max
      options: { flags: 'a' }   // append mode
    })
  ],
});

// Fonction utilitaire pour loguer une action
function logHistory(action, user = 'system') {
  const message = `Action: ${action}, Par: ${user}`;
  historyLogger.info(message);
}

module.exports = logHistory;
