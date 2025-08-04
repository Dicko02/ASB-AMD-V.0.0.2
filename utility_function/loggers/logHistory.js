const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs'); // Chemin vers le dossier logs

// Verification de l'existance du dossier auquel logsDir fait reference(/logs)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Définir les chemins pour le fichier de logHistory
const historyLogFile = path.join(logsDir, 'history.log');

// Fonction spéciale pour l’historique métier
function logHistory(action, user = 'system') {
  const timestamp = new Date().toISOString();
  const message = `Action: ${action}, Par: ${user}`;

  // Enregistre dans le fichier `history.log`
  const historyLogger = createLogger({
    format: format.combine(
      format.printf(() => `[${timestamp}] ${message}`)
    ),
    transports: [
      new transports.File({ filename: historyLogFile })
    ]
  });

  historyLogger.info('');// on écrit sans rien puisque tout est déjà dans format
}


module.exports = logHistory;