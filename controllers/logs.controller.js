// Modules nécessaires pour gérer les fichiers et les chemins
const fs = require('fs');
const path = require('path');

// 📁 Chemin du dossier contenant les fichiers de logs (../logs)
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Liste des types de logs que l'on autorise à consulter ou télécharger
const allowedLogTypes = ['app', 'history', 'access'];


// Pour LIRE le contenu d’un fichier log donné
module.exports.getLogContent = (req, res) => {
  // Récupère le type de log demandé depuis l’URL (ex: 'app', 'history')
  const { logType } = req.params;

  // Si le type n'est pas dans la liste des types autorisés → erreur 400
  if (!allowedLogTypes.includes(logType)) {
    return res.status(400).json({ error: 'Type de log non autorisé.' });
  }

  // 📂 Construit le chemin complet vers le fichier de log
  const filePath = path.join(LOGS_DIR, `${logType}.log`);

  // Vérifie si le fichier existe réellement
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier introuvable.' });
  }

  // Lit le contenu du fichier en texte brut (utf8)
  const content = fs.readFileSync(filePath, 'utf8');

  // Envoie une réponse de type texte (text/plain)
  res.setHeader('Content-Type', 'text/plain');
  res.send(content);
};


// Pour TÉLÉCHARGER un fichier log donné
module.exports.downloadLogFile = (req, res) => {
  // Récupère le type de log demandé depuis l’URL
  const { logType } = req.params;

  // Si le type n'est pas autorisé → erreur 400
  if (!allowedLogTypes.includes(logType)) {
    return res.status(400).json({ error: 'Type de log non autorisé.' });
  }

  // 📂 Construit le chemin vers le fichier log correspondant
  const filePath = path.join(LOGS_DIR, `${logType}.log`);

  // Si le fichier n'existe pas → erreur 404
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier introuvable.' });
  }

  // lance le telechargement du fichier au client
  res.download(filePath);
};
