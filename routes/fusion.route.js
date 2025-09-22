const express = require('express'); 
const router = express.Router();
const fusionControllers = require('../controllers/fusion.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Récupération de toutes les machines
router.get('/', authMiddleware, fusionControllers.getAllFusion);

// Récupération d'une machine par CN (AD)
router.get('/AD/:CN', authMiddleware, fusionControllers.getFusionByCN);

// Récupération d'une machine par Nom (noAD)
router.get('/noAD/:Nom', authMiddleware, fusionControllers.getFusionByNom);

// Suppression d'une machine par CN (AD)
router.delete('/AD/:CN', authMiddleware, fusionControllers.deleteFusionByCN);

// Suppression d'une machine par Nom (noAD)
router.delete('/noAD/:Nom', authMiddleware, fusionControllers.deleteFusionByNom);

module.exports = router;
