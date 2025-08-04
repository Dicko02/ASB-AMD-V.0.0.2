const express = require('express');
const router = express.Router();
const fusionControllers = require('../controllers/fusion.controller');
const authMiddleware = require('../middlewares/auth.middleware');


// affichage des infos de tous les ordinateurs
router.get('/', authMiddleware, fusionControllers.getAllFusion);

// affichage des infos d'un ordinateur
router.get('/:CN', authMiddleware, fusionControllers.fusionInfo);

// suppression d'un utilisateur
router.delete('/:CN', authMiddleware, fusionControllers.deleteFusion)


module.exports = router;