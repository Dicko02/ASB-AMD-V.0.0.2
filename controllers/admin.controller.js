const adminModel = require('../models/admin.model');
const conformitySettingModel = require('../models/conformitySetting.model');
// Importe bcrypt et jsonwebtoken en haut du fichier
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Route POST : Connection en tant qu'administrateur
module.exports.loginAdmin = async (req, res) => {
  const { pseudo, password } = req.body;

  try {
    const admin = await adminModel.findOne({ pseudo });

    if (!admin){
      return res.status(401).json({ message: "Pseudo incorrect ou non enregistré" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid){
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Crée un token signé (JWT)
    const token = jwt.sign(
      {
        id: admin._id,
        pseudo: admin.pseudo,
        titre: admin.titre,
        sessionId: crypto.randomUUID()
      },
      process.env.TOKEN_SECRET || "token",
      {
        expiresIn: "2h"
      }
    );

    res.status(200).json({
      id: admin._id,
      pseudo: admin.pseudo,
      titre: admin.titre,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Route POST : Ajouter un administrateur
module.exports.signUp = async (req, res) => {
    try{
        const admin = new adminModel({
          pseudo: req.body.pseudo,
          titre: req.body.titre,
          password: req.body.password
        });
        // Une fois le user créé, on crée aussi son document paramètres
        await conformitySettingModel.create({ adminId: admin._id });
        await admin.save()
        res.status(200).json({ message: 'Compte ajoute avec succes', adminID: admin._id });
    }catch (err) {
        console.error("Erreur lors de la creation du compte :", err);
        res.status(500).json({err})
    }
};

// Route GET : Récupérer tous les administrateurs
module.exports.getAllAdmin = async (req, res) => {
    try {
        const admins = await adminModel.find().select('-password');
        res.status(200).json(admins);
    } catch (err) {
        console.error("Erreur lors de la récupération des administrateurs :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les administrateurs"});
    }
};

// Route GET : Récupérer les infos d'un administrateur
module.exports.adminInfo = async (req, res) => {
    try {
      const admin = await adminModel.findById(req.params.id).select('-password');
      if (!admin) {
        return res.status(404).json({message: 'administrateur non enregistre'});
      }
      res.json(admin);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des infos de l'administrateur", error });
    }
}
  
// Route UPDATE : Mettre a jour un administrateur
module.exports.updateAdmin = async (req, res) => {
  try {
    const { pseudo, titre, password } = req.body;

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await adminModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(pseudo && { pseudo }), // n'inclut que si pseudo est fourni
          ...(titre && { titre }), // n'inclut que si titre est fourni
          ...(hashedPassword && { password: hashedPassword }) // idem pour le mot de passe
        }
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Compte Admin non trouvé' });
    }

    res.json({ message: 'Compte Admin mis à jour', admin: updatedAdmin });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du compte Admin', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du compte Admin', error: err.message });
  }
};

// Route DELETE : supprimer un administrateur
module.exports.deleteAdmin = async (req, res) => {
    try {
      const deleteAdmin = await adminModel.findByIdAndDelete(req.params.id);
      if (!deleteAdmin) {
        return res.status(404).json({ message: "l'administrateur n'existe deja pas" });
      }
      res.json({ message: 'administrateur supprimée', admin: deleteAdmin });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression de l'administrateur", error });
    }
};
