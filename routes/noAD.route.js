const express = require('express');
const router = express.Router();
const noADControllers = require('../controllers/noAD.controller');
const authMiddleware = require('../middlewares/auth.middleware');


// affichage des infos de tous les noAD
router.get('/', authMiddleware, noADControllers.getAllNoAD);

// affichage des infos d'un noAD
router.get('/:Nom', authMiddleware, noADControllers.noADInfo);

// suppression d'un noAD
router.delete('/:Nom', authMiddleware, noADControllers.deleteNoAD)


module.exports = router;