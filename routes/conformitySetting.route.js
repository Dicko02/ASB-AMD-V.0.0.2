const express = require('express');
const router = express.Router();
const conformitySettingControllers = require('../controllers/conformitySetting.controller');
const authMiddleware = require('../middlewares/auth.middleware');


// affichage des configs de 
router.get('/', authMiddleware, conformitySettingControllers.getConformitySetting);

// admin = mise a jour d'un administrateur
router.put('/', authMiddleware, conformitySettingControllers.updateConformitySetting)


module.exports = router;