const fusionModel = require('../models/fusion.model');
const logHistory = require('../utility_function/loggers/logHistory');

// Route GET : Récupérer tous les machines
module.exports.getAllFusion = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    try {
        const fusions = await fusionModel.find();
        
        //enregistrement du log dans l'historique des audits utilisateurs
        logHistory("✅ Consultation de la liste des endpoints", user);

        res.status(200).json(fusions);
    } catch (err) {
        logHistory("❌ Echec de la consultation de la liste des endpoints", user);
        console.error("Erreur lors de la récupération des infos des machines :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les infos des machines"});
    }
};

// Route GET : Récupérer les infos d'une machine
module.exports.fusionInfo = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const CN = req.params.CN
    try {
        const fusion = await fusionModel.findOne({CN: CN});
        if (!fusion) {
            return res.status(404).json({message: "machine non enregistre"});
        };

        logHistory(`✅ Consultation des details de l'endpoint ${CN}`, user);

        res.json(fusion);

    } catch (error) {
        logHistory(`❌ Echec de la consultation des details de l'endpoint ${CN}`, user);
        res.status(500).json({ message: "Erreur lors de la récupération des infos de la machine", error });
    }
}


// Route DELETE : supprimer une machine
module.exports.deleteFusion = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const CN = req.params.CN
    try {
        const deleteFusion = await fusionModel.findOneAndDelete({CN: CN});
        if (!deleteFusion) {
            return res.status(404).json({ message: "l'machine n'existe deja pas" });
        };

        logHistory(`✅ Suppression de l'endpoint ${CN} du system`, user);

        res.json({ message: 'machine supprimée', fusion: deleteFusion });

    } catch (error) {
        logHistory(`❌ Echec Suppression de l'endpoint ${CN} du system`, user);
        res.status(500).json({ message: "Erreur lors de la suppression de la machine", error });
    }
};