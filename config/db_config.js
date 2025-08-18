// Importation du module mongoose
const mongoose = require('mongoose');
require('dotenv').config({quiet: true}); // Charger les variables d'environnement
const logHistory = require('../utility_function/loggers/logHistory')

const user = "System";

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("✅ MongoDB Connected");
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
    
  }).catch(
    err => {
      console.error("❌ Connection error: " + err);
      logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
    }
  );
