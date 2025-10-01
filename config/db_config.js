// Importation du module mongoose
const mongoose = require('mongoose');
const logHistory = require('../utility_function/loggers/logHistory');
const adminModel = require('../models/admin.model');

const user = "System";

// Connexion à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(async () => {
        // Vérification de l'admin par défaut
        const defaultAdmin = await adminModel.findOne({ pseudo: "admin" });

        if (!defaultAdmin) {
          const admin = new adminModel({
            pseudo: process.env.USER_NAME,
            titre: "Super Admin",
            status: "active",
            password: process.env.USER_PASSWORD
          });

          await admin.save();
          console.log("👑 Utilisateur admin par défaut créé !");
        } else {
          console.log("ℹ️ Admin par défaut déjà présent");
        }
      }
    );
    console.log("✅ MongoDB Connected");
    logHistory("✅ Succes de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
  } catch (error) {
    console.error("❌ Connection error: " + error);
    logHistory("❌ Echec de la fusion des tous donnees dont l'endpoint est absent d'AD", user);
  }
}

module.exports = connectDB;