const mongoose = require('mongoose');

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