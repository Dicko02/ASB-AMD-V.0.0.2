const noADModel = require('../models/noAD.model');


// Route GET : Récupérer tous les machines noAD
module.exports.getAllNoAD = async (req, res) => {
    try {
        const noAD = await noADModel.find();
        res.status(200).json(noAD);
    } catch (err) {
        console.error("Erreur lors de la récupération des infos des noAD :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les infos des noAD"});
    }
};

// Route GET : Récupérer les infos d'une machine noAD
module.exports.noADInfo = async (req, res) => {
    try {
        const id = req.params._id
        const noAD = await noADModel.findById(id);
        if (!noAD) {
            return res.status(404).json({message: "noAD non enregistre"});
        }
        res.json(noAD);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des infos de la machine noAD", error });
    }
}


// Route DELETE : supprimer une machine noAD
module.exports.deleteNoAD = async (req, res) => {
    try {
        const id = req.params._id
        const deleteNoAD = await noADModel.findByIdAndDelete(id);
        if (!deleteNoAD) {
            return res.status(404).json({ message: "l'machine noAD n'existe deja pas" });
        }
        res.json({ message: 'machine noAD supprimée', noAD: deleteNoAD });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la machine noAD", error });
    }
};