const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
    {
        CN: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },

        BadLogonCount: {
            type: Number
        },

        CanonicalName: {
            type: String
        },

        DNSHostName: {
            type: String
        },

        Enabled: {
            type: String
        },

        IPv4Address: {
            type: String
        },

        LastLogonDate: {
            type: Date
        },

        OperatingSystem: {
            type: String
        },

        OperatingSystemVersion: {
            type: String
        },

        whenCreated: {
            type: Date
        },
    }
);

const adModel = mongoose.model('AD', adSchema);
module.exports = adModel;