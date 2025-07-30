const express = require('express');
const router = express.Router();
const fusionControllers = require('../controllers/fusion.controller');


// affichage des infos de tous les ordinateurs
router.get('/', fusionControllers.getAllFusion);

// affichage des infos d'un ordinateur
router.get('/:CN', fusionControllers.fusionInfo);

// suppression d'un utilisateur
router.delete('/:CN', fusionControllers.deleteFusion)


module.exports = router;