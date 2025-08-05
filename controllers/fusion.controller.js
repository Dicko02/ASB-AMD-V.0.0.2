const fusionModel = require('../models/fusion.model');
const logHistory = require('../utility_function/loggers/logHistory');

let user;
let action;

// Route GET : Récupérer tous les machines
module.exports.getAllFusion = async (req, res) => {
    try {
        const fusions = await fusionModel.find();

        console.log('fusions: ', fusions);
        
        //enregistrement du log dans l'historique des audits utilisateurs
        user = req.user.pseudo;
        action = "✅ Consultation de la liste des endpoints";
        logHistory(action, user);

        res.status(200).json(fusions);
    } catch (err) {
        user = req.user.pseudo;
        action = "❌ Echec de la consultation de la liste des endpoints";
        logHistory(action, user);
        console.error("Erreur lors de la récupération des infos des machines :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les infos des machines"});
    }
};

// Route GET : Récupérer les infos d'une machine
module.exports.fusionInfo = async (req, res) => {
    try {
        const CN = req.params.CN
        const fusion = await fusionModel.findOne({CN: CN});
        if (!fusion) {
            return res.status(404).json({message: "machine non enregistre"});
        };

        user = req.user.pseudo;
        action = `✅ Consultation des details de l'endpoint ${CN}`;
        logHistory(action, user);

        res.json(fusion);

    } catch (error) {
        user = req.user.pseudo;
        action = "❌ Echec de la consultation des details d'un endpoint";
        logHistory(action, user);
        res.status(500).json({ message: "Erreur lors de la récupération des infos de la machine", error });
    }
}


// Route DELETE : supprimer une machine
module.exports.deleteFusion = async (req, res) => {
    try {
        const CN = req.params.CN
        const deleteFusion = await fusionModel.findOneAndDelete({CN: CN});
        if (!deleteFusion) {
            return res.status(404).json({ message: "l'machine n'existe deja pas" });
        };

        user = req.user.pseudo;
        action = `✅ Suppression de l'endpoint ${CN} du system`;
        logHistory(action, user);

        res.json({ message: 'machine supprimée', fusion: deleteFusion });

    } catch (error) {
        user = req.user.pseudo;
        action = "❌ Echec Suppression d'un endpoint du system";
        logHistory(action, user);
        res.status(500).json({ message: "Erreur lors de la suppression de la machine", error });
    }
};