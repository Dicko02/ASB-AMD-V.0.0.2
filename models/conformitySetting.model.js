const mongoose = require('mongoose');

const conformitySettingSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true // Assure un seul document par admin
  },

  conformityToCheck: {
    type: [String],
    default: [
        "AntivirusActif",
        "AntivirusAJour",
        "DerniereConnexionUtilisateur",
        "DisqueChiffre",
        "NomDeMachineConforme",
        "PareFeuActive",
        "VolumesPourcentageLibreSuffisant",
        "BadLogonCount"
    ]
  }
});

const conformitySettingModel = mongoose.model('ConformitySetting', conformitySettingSchema);
module.exports = conformitySettingModel;
