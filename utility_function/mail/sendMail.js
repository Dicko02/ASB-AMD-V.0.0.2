const mail = require('./mail');
const mailModel = require('../../models/mail.model');
const logHistory = require('../loggers/logHistory');
const object = require('./object');
const demandeurNom = process.env.DEMANDEUR_NOM;

//fonction d'envoi de mail
async function sendMail(endpoint, inconformites, addressIP, lieu, utilisateur, incoherenceNumber, incoherenceTotalScore, typeMachine) {
    const user = "System";

    try {
        // Sécuriser la division par zéro
        if (!incoherenceTotalScore || incoherenceTotalScore === 0) {
            throw new Error("Le score total d'incohérence est nul ou invalide.");
        }

        // Calculs sécurisés
        const pourcentageIncoherence = (incoherenceNumber / incoherenceTotalScore) * 100;
        const pourcentageCoherence = (100 - pourcentageIncoherence).toFixed(2);

        // Message final
        const message = `${typeMachine ?? 'endpoint'} ${endpoint ?? 'Inconnu'} d'adresse IP ${addressIP ?? 'Inconnu'} se trouvant à ${lieu ?? 'Inconnu'} ayant pour proprietaire ${utilisateur ?? 'Inconnu'} et cohérent à ${pourcentageCoherence ?? '???'}% est dans un état critique, voici la liste des problemes a resoudre: ${inconformites ?? 'Aucune donnée fournie'}`;

        // Vérifier si le mail existe déjà
        const mailExistant = await mailModel.findOne({ endpoint });

        if (mailExistant) {
            console.log(`❌ Le mail a propos de "${endpoint}" existe déjà, pas d'ajout.`);
        }else{
            // Création et sauvegarde si pas trouvé
            const nouveauMail = new mailModel({ endpoint, message });
            await nouveauMail.save();

            // Envoi
            const subject = object(demandeurNom, endpoint, inconformites);
            await mail(subject, message);
            console.log(`Email envoyé avec succès à propos de ${endpoint ?? 'Inconnu'}.`);
            logHistory(`✅ Mail de prise en charge de ${endpoint} envoye avec succes`, user);
        }

    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email : ${error.message}`);
        logHistory(`❌ Echec de l'envoie du mail de prise en charge de ${endpoint}`, user);
    }
}

module.exports = sendMail;
