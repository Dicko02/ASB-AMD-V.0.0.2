const mongoose = require('mongoose');

const glpiSchema = new mongoose.Schema(
    {
        Nom: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },

        Lieu: {
            type: String
        },

        VolumesPourcentageLibre: {
            type: String
        },

        AntivirusNom: {
            type: String
        },

        AntivirusActif: {
            type: String
        },

        AntivirusVersion: {
            type: String
        },

        Utilisateur: {
            type: String
        },
    }
);

const glpiModel = mongoose.model('glpi', glpiSchema);
module.exports = glpiModel;