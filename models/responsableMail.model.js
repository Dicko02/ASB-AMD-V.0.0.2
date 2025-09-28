const mongoose = require('mongoose');

const responsableMailSchema = new mongoose.Schema(
    {
        endpoint: {
            type: String,
            require: true,
            unique: true,
            trim: true
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

const responsableMail = mongoose.model('responsableMail', responsableMailSchema);
module.exports = responsableMail;