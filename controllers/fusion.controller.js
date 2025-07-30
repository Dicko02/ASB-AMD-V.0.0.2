const fusionModel = require('../models/fusion.model');


// Route GET : Récupérer tous les machines
module.exports.getAllFusion = async (req, res) => {
    try {
        const fusions = await fusionModel.find();
        res.status(200).json(fusions);
    } catch (err) {
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
        }
        res.json(fusion);
    } catch (error) {
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
        }
        res.json({ message: 'machine supprimée', fusion: deleteFusion });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la machine", error });
    }
};