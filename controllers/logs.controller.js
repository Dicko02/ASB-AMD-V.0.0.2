const fs = require('fs');
const path = require('path');
const allowedLogTypes = ['app', 'history', 'access'];// Liste des types de logs que l'on autorise à consulter ou télécharger
const logHistory = require('../utility_function/loggers/logHistory');
const analyserLogsApp = require('../utility_function/appLogs/analyserLogsApp');

const LOGS_DIR = path.join(__dirname, '..', 'logs');// Chemin du dossier contenant les fichiers de logs (../logs)

// Pour lire le contenu d'un fichier log precis
function getLogContent(req, res){
  const user = req.user?.pseudo || 'Inconnu';
  const { logType } = req.params;// Récupère le type de log demandé depuis l’URL (ex: 'app', 'history')

  // Vérifie si le dossier des logs existe, sinon le crée
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
  
  try{

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
    logHistory(`✅ Consultation des logs de type <${logType}>`, user);

    // Envoie une réponse de type texte (text/plain)
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).json(content.split("\n"));

  }catch(err){
    logHistory(`❌ Echec de la consultation des logs de type <${logType}>`, user);
    console.error(`Erreur lors de la consultation des logs de type <${logType}> :`, err);
    res.status(500).json({error: `Erreur serveur, impossible de consulter les logs de type <${logType}>`});
  }
  
};


// Pour telecharger un fichier log precis
function downloadLogFile(req, res){
  const user = req.user?.pseudo || 'Inconnu';
  const { logType } = req.params;// Récupère le type de log demandé depuis l’URL

  try{
    // Si le type n'est pas autorisé(erreur 400)
    if (!allowedLogTypes.includes(logType)) {
      return res.status(400).json({ error: 'Type de log non autorisé.' });
    };

    const filePath = path.join(LOGS_DIR, `${logType}.log`);// Construit le chemin vers le fichier log correspondant

    // Si le fichier n'existe pas → erreur 404
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable.' });
    };

    logHistory(`✅ Telechargement d'un rapport sur les logs de type <${logType}>`, user);

    res.download(filePath);// lance le telechargement du fichier au client

  }catch{
    logHistory(`❌ Echec du telechargement d'un rapport sur les logs de type <${logType}>`, user);
    console.error(`Erreur lors du telechargement d'un rapport sur les logs de type <${logType}> :`, err);
    res.status(500).json({error: `Erreur serveur, impossible de telecharger le rapport sur les logs de type <${logType}>`});
  }
  
};

// Route GET : Récupérer tous les machines non conforme depuis un certain temp
function getAllCritiquesDurables (req, res) {
  const user = req.user?.pseudo || 'Inconnu';
    try {
        const filePath = path.join(LOGS_DIR, 'app.log');// Chemin complet vers le fichier app.log
        const resultats = analyserLogsApp(filePath);

        logHistory("✅ Consultation de la liste des endpoints critiques durable", user);

        res.status(200).json(resultats);

    } catch (err) {
        logHistory("❌ Echec de la consultation de la liste des endpoints critiques durable", user);
        console.error("Erreur lors de la récupération des des endpoints critiques durable :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les infos des endpoints critiques durable"});
    }
};

module.exports = {getLogContent, downloadLogFile, getAllCritiquesDurables}
