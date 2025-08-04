const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');


// Ajoute cette ligne AVANT les exports :
router.post('/login', adminControllers.loginAdmin);

// admin = creation d'un nouveau administrateur
router.post('/register', authMiddleware, adminControllers.signUp);

// admin = affichage des administrateurs
router.get('/', authMiddleware, adminControllers.getAllAdmin);

// admin = affichage d'un administrateur
router.get('/:id', authMiddleware, adminControllers.adminInfo);

// admin = mise a jour d'un administrateur
router.put('/update/:id', authMiddleware, adminControllers.updateAdmin);

// admin = suppression d'un administrateur
router.delete('/delete/:id', authMiddleware, adminControllers.deleteAdmin)


module.exports = router;