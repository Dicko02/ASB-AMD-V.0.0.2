const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs'); // Chemin vers le dossier logs

// Verification de l'existance du dossier auquel logsDir fait reference(/logs)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Définir les chemins pour le fichier de logger
const appLogFile = path.join(logsDir, 'app.log');

// Créer un logger Winston pour les logs généraux
const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new transports.File({ filename: appLogFile }), // logs techniques
    new transports.Console() // affichage console
  ],
});

module.exports = logger;
