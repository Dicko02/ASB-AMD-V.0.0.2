const mail = require('./mail');
const mailModel = require('../../models/mail.model');
const logHistory = require('../loggers/logHistory');
const object = require('./object');
const demandeurNom = process.env.DEMANDEUR_NOM;
const mailContente = require('./message');

//fonction d'envoi de mail
async function sendMail(endpoint) {
    const user = "System";

    try {

        // Message final
        const message = mailContente(endpoint);

        // Vérifier si le mail existe déjà
        const mailExistant = await mailModel.findOne({ 'endpoint': endpoint.CN });

        if (mailExistant) {
            console.log(`❌ Le mail a propos de "${endpoint.CN}" existe déjà, pas d'ajout.`);
        }else{
            // Création et sauvegarde si pas trouvé
            const nouveauMail = new mailModel({ 'endpoint': endpoint.CN, message });
            await nouveauMail.save();

            // Envoi
            const subject = object(demandeurNom, endpoint.CN, endpoint.ConformitiesChecked);
            await mail(subject, message.htmlContent, message.textContent);
            console.log(`Email envoyé avec succès à propos de ${endpoint.CN ?? 'Inconnu'}.`);
            logHistory(`✅ Mail de prise en charge de ${endpoint.CN} envoye avec succes`, user);
        }

    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email : ${error.message}`);
        logHistory(`❌ Echec de l'envoie du mail de prise en charge de ${endpoint.CN}`, user);
    }
}

module.exports = sendMail;
