const mongoose = require('mongoose');

// Schéma souple : on n'impose pas tous les champs
const mailSchema = new mongoose.Schema(
    {
        ticketId: {
            type: Number,
        },

        endpoint: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },

        reopenAt: {
            type: Date
        },

        message: {
            htmlContent: String,
            textContent: String
        }
    },
    
    {
        timestamps: true
    }
);

const mail = mongoose.model('mail', mailSchema);
module.exports = mail;