const mongoose = require('mongoose');

// Schéma souple : on n'impose pas tous les champs
const fusionSchema = new mongoose.Schema(
    {
        criticalLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },

        dangerousityNumber: {
            type: Number,
            default: 0
        },

        //conformites verifier et non conforme
        ConformitiesChecked: {
            type: [String],
            default: []
        },
        
        Composites: {
            type: [String],
            default: []
        },

        incoherenceNumber: {
            type: Number,
            default: 0
        },

        //coherence verifier et incoherence
        incoherences: {
            type: [String],
            default: []
        },

        incoherenceTotalScore: {
            type: Number,
            default: 0
        }
    },
    
    {
        strict: false,
        timestamps: true
    }
);

const fusion = mongoose.model('fusion', fusionSchema);
module.exports = fusion;
