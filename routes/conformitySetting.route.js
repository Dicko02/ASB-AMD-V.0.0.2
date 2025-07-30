const express = require('express');
const router = express.Router();
const conformitySettingControllers = require('../controllers/conformitySetting.controller');


// affichage des configs de 
router.get('/', conformitySettingControllers.getConformitySetting);

// admin = mise a jour d'un administrateur
router.put('/', conformitySettingControllers.updateConformitySetting)


module.exports = router;