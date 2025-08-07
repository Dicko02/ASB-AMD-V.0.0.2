// Importation du module mongoose
const mongoose = require('mongoose');
require('dotenv').config({quiet: true}); // Charger les variables d'environnement
const logHistory = require('../utility_function/loggers/logHistory')

let user = "System";

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    action = "✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD";
    logHistory(action, user);
  })
  .catch(
    err => {
      console.error("❌ Connection error: " + err);
      action = "❌ Echec de la fusion des tous donnees dont l'endpoint est absent d'AD";
      logHistory(action, user);
    }
  );
