const express = require('express');
const router = express.Router();
const criticalLevelMaxValueControllers = require('../controllers/criticalLevelMaxValue.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes pour gérer les paramètres de niveaux de criticité
router.get('/', authMiddleware, criticalLevelMaxValueControllers.getcriticalLevelMaxValue);
router.put('/', authMiddleware, criticalLevelMaxValueControllers.updateCriticalLevelMaxValue)


module.exports = router;