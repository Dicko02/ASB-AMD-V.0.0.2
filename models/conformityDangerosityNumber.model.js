const mongoose = require('mongoose');

// Schéma pour stocker les numéros de dangerosité des conformités
const conformityDangerosityNumberSchema = new mongoose.Schema({
    AntivirusActif: [{

        Wrong:{
            type: Number,
            default: 1
        },

        Absent:{
            type: Number,
            default: 2
        }

    }],

    AntivirusAJour: [{

        Wrong:{
            type: Number,
            default: 1
        },

        Absent:{
            type: Number,
            default: 2
        }

    }],

    BadLogonCount: [{

        Wrong:{
            type: Number,
            default: 2
        },

        Absent:{
            type: Number,
            default: 3
        }

    }],

    DerniereConnexionUtilisateur: [{

        Wrong:{
            type: Number,
            default: 2
        },

        Absent:{
            type: Number,
            default: 3
        }

    }],

    DisqueChiffre: [{

        Wrong:{
            type: Number,
            default: 1
        },

        Absent:{
            type: Number,
            default: 2
        }

    }],

    NomDeMachineConforme: [{

        Wrong:{
            type: Number,
            default: 2
        },

        Absent:{
            type: Number,
            default: 3
        }

    }],

    PareFeuActive: [{

        Wrong:{
            type: Number,
            default: 1
        },

        Absent:{
            type: Number,
            default: 2
        }

    }],

    VolumesPourcentageLibreSuffisant: [{

        Wrong01:{
            type: Number,
            default: 1
        },

        Wrong02:{
            type: Number,
            default: 2
        },

        Wrong03:{
            type: Number,
            default: 3
        },

        Absent:{
            type: Number,
            default: 3
        }

    }],

    NoAD:{
        type: Number,
        default: 10
    },

    NoGLPI:{
        type: Number,
        default: 10
    },

    NoKaspersky:{
        type: Number,
        default: 10
    }
    
});


const conformityDangerosityNumber = mongoose.model('conformityDangerosityNumber', conformityDangerosityNumberSchema);
module.exports = conformityDangerosityNumber;
