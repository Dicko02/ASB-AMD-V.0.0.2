const mongoose = require('mongoose');

// Schéma souple : on n'impose pas tous les champs
const noADSchema = new mongoose.Schema(
    {
        Composites: {
            type: [String],
            default: []
        },
    },
    
    {
        strict: false,
        timestamps: true
    }
);

const noAD = mongoose.model('noAD', noADSchema);
module.exports = noAD;
