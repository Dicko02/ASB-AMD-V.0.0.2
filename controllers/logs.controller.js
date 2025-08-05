const fs = require('fs');
const path = require('path');
const LOGS_DIR = path.join(__dirname, '..', 'logs');// Chemin du dossier contenant les fichiers de logs (../logs)
const allowedLogTypes = ['app', 'history', 'access'];// Liste des types de logs que l'on autorise à consulter ou télécharger
const logHistory = require('../utility_function/loggers/logHistory');

let user;
let action;

// Pour lire le contenu un fichier log precis
function getLogContent(req, res){
  try{
    const { logType } = req.params;// Récupère le type de log demandé depuis l’URL (ex: 'app', 'history')

    // Si le type n'est pas dans la liste des types autorisés → erreur 400
    if (!allowedLogTypes.includes(logType)) {
      return res.status(400).json({ error: 'Type de log non autorisé.' });
    };

    const filePath = path.join(LOGS_DIR, `${logType}.log`);// Construit le chemin complet vers le fichier de log

    // Vérifie si le fichier existe réellement
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable.' });
    };

    const content = fs.readFileSync(filePath, 'utf8');// Lit le contenu du fichier en texte brut (utf8)

    //enregistrement du log dans l'historique des audits utilisateurs
    user = req.user.pseudo;
    action = `✅ Consultation des logs de type <${logType}>`;
    logHistory(action, user);

    // Envoie une réponse de type texte (text/plain)
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);

  }catch{
    user = req.user.pseudo;
    action = `❌ Echec de la consultation des logs de type <${logType}>`;
    logHistory(action, user);
  }
  
};


// Pour telecharger un fichier log precis
function downloadLogFile(req, res){
  try{
    const { logType } = req.params;// Récupère le type de log demandé depuis l’URL

    // Si le type n'est pas autorisé(erreur 400)
    if (!allowedLogTypes.includes(logType)) {
      return res.status(400).json({ error: 'Type de log non autorisé.' });
    };

    const filePath = path.join(LOGS_DIR, `${logType}.log`);// Construit le chemin vers le fichier log correspondant

    // Si le fichier n'existe pas → erreur 404
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable.' });
    };

    user = req.user.pseudo;
    action = `✅ Telechargement d'un rapport sur les logs de type <${logType}>`;
    logHistory(action, user);

    res.download(filePath);// lance le telechargement du fichier au client

  }catch{
    user = req.user.pseudo;
    action = `❌ Echec du telechargement d'un rapport sur les logs de type <${logType}>`;
    logHistory(action, user);
  }
  
};

module.exports = {getLogContent, downloadLogFile}
