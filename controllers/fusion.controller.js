const fusionModel = require('../models/fusion.model');
const logHistory = require('../utility_function/loggers/logHistory');

// GET : Récupérer toutes les machines
module.exports.getAllFusion = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    try {
        const fusions = await fusionModel.find();
        logHistory("✅ Consultation de la liste des endpoints (AD + noAD)", user);
        res.status(200).json(fusions);
    } catch (err) {
        logHistory("❌ Echec de la consultation de la liste des endpoints", user);
        console.error("Erreur lors de la récupération des infos des machines :", err);
        res.status(500).json({ error: "Erreur serveur, impossible de récupérer les infos des machines" });
    }
};

// GET : Récupérer une machine par CN (AD)
module.exports.getFusionByCN = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const { CN } = req.params;
    try {
        const fusion = await fusionModel.findOne({ CN });
        if (!fusion) {
            return res.status(404).json({ message: "Machine AD non enregistrée" });
        }
        logHistory(`✅ Consultation des détails de l'endpoint AD ${CN}`, user);
        res.json(fusion);
    } catch (error) {
        logHistory(`❌ Echec consultation des détails de l'endpoint AD ${CN}`, user);
        res.status(500).json({ message: "Erreur lors de la récupération de la machine AD", error });
    }
};

// GET : Récupérer une machine par Nom (noAD)
module.exports.getFusionByNom = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const { Nom } = req.params;
    try {
        const fusion = await fusionModel.findOne({ Nom });
        if (!fusion) {
            return res.status(404).json({ message: "Machine noAD non enregistrée" });
        }
        logHistory(`✅ Consultation des détails de l'endpoint noAD ${Nom}`, user);
        res.json(fusion);
    } catch (error) {
        logHistory(`❌ Echec consultation des détails de l'endpoint noAD ${Nom}`, user);
        res.status(500).json({ message: "Erreur lors de la récupération de la machine noAD", error });
    }
};

// DELETE : Supprimer une machine par CN (AD)
module.exports.deleteFusionByCN = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const { CN } = req.params;
    try {
        const deleted = await fusionModel.findOneAndDelete({ CN });
        if (!deleted) {
            return res.status(404).json({ message: "La machine AD n'existe pas" });
        }
        logHistory(`✅ Suppression de l'endpoint AD ${CN}`, user);
        res.json({ message: 'Machine AD supprimée', fusion: deleted });
    } catch (error) {
        logHistory(`❌ Echec suppression de l'endpoint AD ${CN}`, user);
        res.status(500).json({ message: "Erreur lors de la suppression de la machine AD", error });
    }
};

// DELETE : Supprimer une machine par Nom (noAD)
module.exports.deleteFusionByNom = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const { Nom } = req.params;
    try {
        const deleted = await fusionModel.findOneAndDelete({ Nom });
        if (!deleted) {
            return res.status(404).json({ message: "La machine noAD n'existe pas" });
        }
        logHistory(`✅ Suppression de l'endpoint noAD ${Nom}`, user);
        res.json({ message: 'Machine noAD supprimée', fusion: deleted });
    } catch (error) {
        logHistory(`❌ Echec suppression de l'endpoint noAD ${Nom}`, user);
        res.status(500).json({ message: "Erreur lors de la suppression de la machine noAD", error });
    }
};
