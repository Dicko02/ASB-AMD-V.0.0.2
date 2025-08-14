const mongoose = require('mongoose');

// Schéma souple : on n'impose pas tous les champs
const mailSchema = new mongoose.Schema(
    {
        endpoint: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },

        message: {
            type: String
        }
    },
    
    {
        timestamps: true
    }
);

const mail = mongoose.model('mail', mailSchema);
module.exports = mail;