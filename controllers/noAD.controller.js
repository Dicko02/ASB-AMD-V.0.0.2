const noADModel = require('../models/noAD.model');
const logHistory = require('../utility_function/loggers/logHistory');

// Route GET : Récupérer tous les machines noAD
module.exports.getAllNoAD = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    try {
        const noAD = await noADModel.find();

        //enregistrement du log dans l'historique des audits utilisateurs
        logHistory("✅ Consultation de la liste des endpoints noAD", user);

        res.status(200).json(noAD);

    } catch (err) {
        logHistory("❌ Echec de la consultation de la liste des endpoints absent de AD mais present dans GLPI et/ou Kasperky", user);
        console.error("Erreur lors de la récupération des infos des noAD :", err);
        res.status(500).json({error: "Erreur serveur, impossible de récupérer les infos des noAD"});
    }
};

// Route GET : Récupérer les infos d'une machine noAD
module.exports.noADInfo = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const Nom = req.params.Nom;
    try {
        const noAD = await noADModel.findOne({Nom: Nom});
        if (!noAD) {
            return res.status(404).json({message: "noAD non enregistre"});
        };

        logHistory(`✅ Consultation des informations de l'endpoint noAD ${Nom}`, user);

        res.json(noAD);

    } catch (error) {
        logHistory(`❌ Echec de la consultation des informations de l'endpoint noAD ${Nom}`, user);
        res.status(500).json({ message: "Erreur lors de la récupération des infos de la machine noAD", error });
    }
}


// Route DELETE : supprimer une machine noAD
module.exports.deleteNoAD = async (req, res) => {
    const user = req.user?.pseudo || 'Inconnu';
    const Nom = req.params.Nom;
    try {
        const deleteNoAD = await noADModel.findOneAndDelete({Nom: Nom});
        if (!deleteNoAD) {
            return res.status(404).json({ message: "l'machine noAD n'existe deja pas" });
        };

        logHistory(`✅ Suppression de l'endpoint noAD ${Nom}`, user);

        res.json({ message: 'machine noAD supprimée', noAD: deleteNoAD });
        
    } catch (error) {
        logHistory(`❌ Echec de la suppression de l'endpoint noAD ${Nom}`, user);
        res.status(500).json({ message: "Erreur lors de la suppression de la machine noAD", error });
    }
};