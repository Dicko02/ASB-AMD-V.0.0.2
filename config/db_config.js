// Importation du module mongoose
const mongoose = require('mongoose');
const logHistory = require('../utility_function/loggers/logHistory')

const user = "System";

// Connexion à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
  } catch (error) {
    console.error("❌ Connection error: " + error);
    logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
  }
}

module.exports = connectDB;