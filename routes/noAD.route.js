const express = require('express');
const router = express.Router();
const noADControllers = require('../controllers/noAD.controller');


// affichage des infos de tous les noAD
router.get('/', noADControllers.getAllNoAD);

// affichage des infos d'un noAD
router.get('/:CN', noADControllers.noADInfo);

// suppression d'un noAD
router.delete('/:CN', noADControllers.deleteNoAD)


module.exports = router;