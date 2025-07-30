const express = require("express");
const bodyParser = require('body-parser');
require("dotenv").config({path: './config/.env', quiet: true});
require('./config/db_config');
const helmet = require("helmet");
const cors = require("cors");

require('./utility_function/cronJob'); // C’est suffisant pour démarrer la tâche planifiée

const fusionRoute = require("./routes/fusion.route");
const adminRoute = require("./routes/admin.route");
const noADRoute = require("./routes/noAD.route");
const conformitySettingRoute = require("./routes/conformitySetting.route");

// Import de la fonction de vérification des conformités
const checkConformites = require("./utility_function/checkConformites");

const app = express();

const port = process.env.PORT;

// Middlewares(doivent être avant les routes)
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/fusion', fusionRoute);
app.use('/api/admin', adminRoute);
app.use('/api/noAD', noADRoute);
app.use('/api/conformitySetting', conformitySettingRoute);

//démarrage du serveur
app.listen(port || 10000, () => {
    console.log(`Listening on port ${port}`);
});


// Lancement de la vérification des conformités
checkConformites().then(() => {
    console.log("Conformités vérifiées et mises à jour.");
}).catch((error) => {
    console.error("Erreur lors de la vérification des conformités:", error);
});


