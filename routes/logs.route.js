const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// affichage des endpoints en danger pendant longtemp
router.get('/critiquesDurables', authMiddleware, logsController.getAllCritiquesDurables);

// GET: contenu brut en temps réel
router.get('/:logType', authMiddleware, logsController.getLogContent);

// GET: téléchargement du fichier log
router.get('/download/:logType', authMiddleware, logsController.downloadLogFile);

module.exports = router;
