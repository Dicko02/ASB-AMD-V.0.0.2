const express = require('express');
const router = express.Router();
const conformityDangerosityNumberControllers = require('../controllers/conformityDangerosityNumber.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes pour gérer les paramètres de dangerosité des conformités
router.get('/', authMiddleware, conformityDangerosityNumberControllers.getConformityDangerosityNumber);
router.put('/', authMiddleware, conformityDangerosityNumberControllers.updateConformityDangerosityNumber)


module.exports = router;