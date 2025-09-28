const adminModel = require('../models/admin.model');
const conformitySettingModel = require('../models/conformitySetting.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logHistory = require('../utility_function/loggers/logHistory');


// Route POST : Connection en tant qu'utilisateur
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

    if(admin.status === 'inactive'){
      return res.status(403).json({ message: "Compte inactif" });
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

    //enregistrement du log dans l'historique des audits utilisateurs
    userConnection = pseudo;
    logHistory(`✅ Connection a la platforme en tant que ${pseudo}`, userConnection);

    res.status(200).json({
      id: admin._id,
      pseudo: admin.pseudo,
      titre: admin.titre,
      token,
    });

  } catch (error) {
    userConnection = pseudo;
    logHistory(`❌ Echec de connection a la platforme en tant que ${pseudo}`, userConnection);
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// Route POST : Ajouter un utilisateur
module.exports.signUp = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  try{
      const admin = new adminModel({
        pseudo: req.body.pseudo,
        titre: req.body.titre,
        status: 'active',
        password: req.body.password
      });      

      logHistory(`✅ Creation du compte de niveau <${req.body.titre}> portant le pseudo: ${req.body.pseudo}`, user);

      res.status(200).json({ message: 'Compte ajoute avec succes', adminID: admin._id });

  }catch (err) {
    logHistory(`❌ Echec de la creation d'un compte utilisateur`, user);
    console.error("Erreur lors de la creation du compte :", err);
    res.status(500).json({err})
  }
};


// Route GET : Récupérer tous les utilisateurs
module.exports.getAllAdmin = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  try {
      const admins = await adminModel.find().select('-password');

      logHistory("✅ Consultation de tous les comptes utilisateurs", user);

      res.status(200).json(admins);

  } catch (err) {
    logHistory(`❌ Echec de la Consultation des comptes utilisateurs`, user);
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    res.status(500).json({error: "Erreur serveur, impossible de récupérer les utilisateurs"});
  }
};


// Route GET : Récupérer les infos d'un utilisateur
module.exports.adminInfo = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  try {
    const admin = await adminModel.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({message: 'utilisateur non enregistre'});
    }

    logHistory(`✅ Consultation des informations de l'utilisateur qui a ID=${req.params.id}`, user);

    res.json(admin);

  } catch (error) {
    logHistory(`❌ Echec de la consultation des informations de l'utilisateur qui a ID=${req.params.id}`, user);
    res.status(500).json({ message: "Erreur lors de la récupération des infos de l'utilisateur", error });
  }
}
  

// Route UPDATE : Mettre a jour un utilisateur
module.exports.updateAdmin = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  const { pseudo, status, titre, password } = req.body;

  try {

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
          ...(status && { status }), // idem pour le statut
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

    logHistory(`✅ Mise a jour du compte de l'utilisateur ${pseudo} de niveau ${titre}`, user);

    res.json({ message: 'Compte Admin mis à jour', admin: updatedAdmin });

  } catch (err) {
    logHistory(`❌ Echec de la Mise a jour de l'utilisateur ${pseudo} de niveau ${titre}`, user);
    console.error('Erreur lors de la mise à jour du compte Admin', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du compte Admin', error: err.message });
  }
};


// Route DELETE : supprimer un utilisateur
module.exports.deleteAdmin = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  try {
    const deleteAdmin = await adminModel.findByIdAndDelete(req.params.id);
    if (!deleteAdmin) {
      return res.status(404).json({ message: "l'utilisateur n'existe deja pas" });
    }

    await conformitySettingModel.findOneAndDelete({ adminId: req.params.id });

    logHistory(`✅ Suppression de l'utilisateur qui a ID=${req.params.id}`, user);

    res.json({ message: 'utilisateur supprimée', admin: deleteAdmin });

  } catch (error) {
    logHistory(`❌ Echec de la Suppression de l'utilisateur qui a ID=${req.params.id}`, user);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error });
  }
};
