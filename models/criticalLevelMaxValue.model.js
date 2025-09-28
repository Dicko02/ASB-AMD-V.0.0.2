const mongoose = require('mongoose');

// Schéma pour stocker les valeurs maximales des niveaux de criticité
const criticalLevelMaxValueSchema = new mongoose.Schema({
    
    lowMaxValue: {
        type: Number,
        default: 3
    },

    mediumMaxValue: {
        type: Number,
        default: 6
    },

    highMaxValue: {
        type: Number,
        default: 10
    },

});


const criticalLevelMaxValue = mongoose.model('criticalLevelMaxValue', criticalLevelMaxValueSchema);
module.exports = criticalLevelMaxValue;
