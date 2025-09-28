const mongoose = require('mongoose');

const conformitySettingSchema = new mongoose.Schema({

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
