const mongoose = require('mongoose');

const kasperskySchema = new mongoose.Schema(
    {
        Nom: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },

        agentAdministrationInstalle: {
            type: String
        },

        agentAdministrationExecution: {
            type: String
        },

        protectionTempsReel: {
            type: String
        },

        DerniereMiseAJourBasesAntivirus: {
            type: String
        },

        etat: {
            type: String
        },

        description: {
            type: String
        },

        groupeParent: {
            type: String
        },

        etatChiffrement: {
            type: String
        },

        DerniereAnalyseComplete: {
            type: Date
        } 
    }
);

const kasperskyModel = mongoose.model('kaspersky', kasperskySchema);
module.exports = kasperskyModel;