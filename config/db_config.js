// Importation du module mongoose
const mongoose = require('mongoose');
require('dotenv').config({quiet: true}); // Charger les variables d'environnement

//const runImportAndFusion = require('./runImportAndFusion'); // Importer la fonction d'importation et de fusion

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    //await runImportAndFusion();
  })
  .catch(err => console.error("❌ Connection error: " + err));
