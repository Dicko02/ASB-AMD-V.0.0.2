const express = require("express");
const bodyParser = require('body-parser');
require("dotenv").config({quiet: true});
//require('./config/db_config');
const helmet = require("helmet");
const cors = require("cors");
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logHistory = require('./utility_function/loggers/logHistory');

require('./utility_function/cronJob'); // C’est suffisant pour démarrer la tâche planifiée

const fusionRoute = require("./routes/fusion.route");
const adminRoute = require("./routes/admin.route");
const conformitySettingRoute = require("./routes/conformitySetting.route");
const logsRoute = require('./routes/logs.route');

// Import de la fonction de vérification des conformités
const checkConformites = require("./utility_function/conformites/checkConformites");

// Import de la fonction de vérification des coherences
const checkCoherences = require("./utility_function/coherence/coherence");
const scoreTotalPossibleIncoherence = require("./utility_function/coherence/scoreTotalPossibleIncoherence")

const app = express();

const port = process.env.PORT;

// Middleware log accès (access.log)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Middlewares(doivent être avant les routes)
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/fusion', fusionRoute);
app.use('/api/admin', adminRoute);
app.use('/api/conformitySetting', conformitySettingRoute);
app.use('/api/logs', logsRoute);

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} non trouvée`
  });
});

//démarrage du serveur
app.listen(port || 10000, `${process.env.IP}`, () => {
    console.log(`Listening on port ${port ?? 10000}`);
});

let user = "System";
// Lancement de la vérification des conformités
checkConformites().then(() => {
    action = "✅ Conformités vérifiées et mises à jour.";
    logHistory(action, user);
    console.log("Conformités vérifiées et mises à jour.");

    checkCoherences().then(() => {
        action = "✅ Coherences vérifiées et mises à jour.";
        logHistory(action, user);
        console.log("Coherences vérifiées et mises à jour.");

        scoreTotalPossibleIncoherence().then(() => {
            console.log("Score total des incoherences mises à jour avec succes.");
        }).catch((error) => {
            console.error("Erreur lors de la mises à jour du score total des incoherences: ", error);
        })
        
    }).catch((error) => {
        action = "❌ Erreur lors de la vérification des coherences";
        logHistory(action, user);
        console.error("Erreur lors de la vérification des coherences: ", error);
    })

}).catch((error) => {
    action = "❌ Erreur lors de la vérification des conformités";
    logHistory(action, user);
    console.error("Erreur lors de la vérification des conformités: ", error);
});


