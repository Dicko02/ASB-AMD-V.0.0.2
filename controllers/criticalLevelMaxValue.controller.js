const criticalLevelMaxValueModel = require('../models/criticalLevelMaxValue.model');
const checkConformites = require("../utility_function/conformites/checkConformites");
const logHistory = require('../utility_function/loggers/logHistory');


// Récupère les paramètres de niveaux de criticité
module.exports.getcriticalLevelMaxValue = async (req, res) => {
  const user = req.user?.pseudo || 'Inconnu';
  try{
    const criticalLevelMaxValue = await criticalLevelMaxValueModel.find();

    //enregistrement du log dans l'historique des audits utilisateurs
    logHistory("✅ Consultation des paramètres de niveaux de criticité", user);

    res.status(200).json(criticalLevelMaxValue);
  }catch(err){
    logHistory("❌ Echec de la consultation des paramètres de niveaux de criticité", user);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


// Met à jour les paramètres de niveaux de criticité
module.exports.updateCriticalLevelMaxValue = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Les nouvelles valeurs doivent être fournies" });
    }

    try {
        // On suppose qu’il n’existe qu’un seul document de configuration
        const updated = await criticalLevelMaxValueModel.findOneAndUpdate(
            {}, // filtre vide = prend le seul doc
            { $set: req.body }, // applique les valeurs envoyées
            { upsert: true, new: true } // crée si n’existe pas, retourne le doc modifié
        );

        // Relance la re-vérification des conformités
        await checkConformites()
            .then(() => {
                console.log("Conformités re-vérifiées après modification.");
            })
            .catch((error) => {
                console.error("Erreur lors de la re-vérification :", error);
            });

        logHistory("✅ Mise à jour des conformités après modification des paramètres de niveaux de criticité", user);

        res.status(200).json(updated);

    } catch (err) {
        logHistory("❌ Échec de la mise à jour des paramètres de niveaux de criticité", user);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
