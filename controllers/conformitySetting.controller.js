const conformitySettingModel = require('../models/conformitySetting.model');
const checkConformites = require("../utility_function/checkConformites");

// GET paramètres des conformites
module.exports.getConformitySetting = async (req, res) => {
  const conformitySetting = await conformitySettingModel.findOne({ adminId: req.admin.id });
  res.json(conformitySetting);
};

// PUT paramètres des conformites
module.exports.updateConformitySetting = async (req, res) => {
  const { adminId, conformityToCheck } = req.body;

  if (!adminId) {
    console.log('adminId manquant dans la requête')
    return res.status(400).json({ message: "adminId manquant dans la requête" });
  }

  if (!Array.isArray(conformityToCheck)) {
    console.log('conformityToCheck doit être un tableau')
    return res.status(401).json({ message: "conformityToCheck doit être un tableau" });
  }

  try {
    const updated = await conformitySettingModel.findOneAndUpdate(
      { adminId },
      { conformityToCheck },
      { upsert: true, new: true }
    );

    // Lancement de la re-vérification des conformités
    await checkConformites().then(() => {
      console.log("Conformités re-vérifiées et re-mises à jour.");
    }).catch((error) => {
      console.error("Erreur lors de la re-vérification des conformités:", error);
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
