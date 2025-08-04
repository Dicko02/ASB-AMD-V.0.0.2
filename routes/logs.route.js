const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');

// GET: contenu brut en temps réel
router.get('/:logType', logsController.getLogContent);

// GET: téléchargement du fichier log
router.get('/download/:logType', logsController.downloadLogFile);

module.exports = router;
