const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin.controller');

// Ajoute cette ligne AVANT les exports :
router.post('/login', adminControllers.loginAdmin);

// admin = creation d'un nouveau administrateur
router.post('/register', adminControllers.signUp);

// admin = affichage des administrateurs
router.get('/', adminControllers.getAllAdmin);

// admin = affichage d'un administrateur
router.get('/:id', adminControllers.adminInfo);

// admin = mise a jour d'un administrateur
router.put('/update/:id', adminControllers.updateAdmin);

// admin = suppression d'un administrateur
router.delete('/delete/:id', adminControllers.deleteAdmin)


module.exports = router;