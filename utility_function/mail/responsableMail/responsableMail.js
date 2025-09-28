const nodemailer = require('nodemailer');
const logHistory = require('../loggers/logHistory');
const responsableMailModel = require('../../../models/responsableMail.model');

//fonction d'envoi de mail
async function responsableMail(endpoint, demandeurNom, jours) {
    const user = "System";

  // Creation d'un transporteur
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_MAIL, // Mail de l'envoyeur
      pass: process.env.SENDER_MAIL_PASSWORD // Mot de passe ou App Password
    }
  });

  // Configuration du message a envoyer au responsable
  const mailOptions = {
    from: process.env.SENDER_MAIL,
    to: process.env.RESPONSABLE_MAIL, // Email du responsable
    subject: `${demandeurNom} Rappel: Ticket non pris en charge pour ${endpoint}`,
    html: `<div style="font-family: Arial, sans-serif; color: #222; line-height: 1.4;"><p>Le ticket pour la prise en charge de <strong>${endpoint}</strong> a été créé il y a déjà <strong>${jours}</strong> jour${jours > 1 ? "s" : ""} et le problème est <strong>toujours d'actualité</strong> ou n'a pas encore été pris en charge.</p></div>`,
    text: `Le ticket pour la prise en charge de ${endpoint} a été créé il y a déjà ${jours} jour${jours > 1 ? "s" : ""} mais le problème est toujours d'actualité ou n'a pas été pris en charge.`
  };

  // Envoi de l'email au responsable
  try {

    // Vérifier si le mail existe déjà
    const mailExistant = await responsableMailModel.findOne({ 'endpoint': endpoint});
    let info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé au responsable : ' + info.response);

    if (mailExistant) {
        console.log(`❌ Le mail envoyer au responsable à propos de "${endpoint}" existe déjà.`);
    }else{
        // Création et sauvegarde si pas trouvé
        const nouveauMail = new responsableMailModel({ 'endpoint': endpoint, 'message': { htmlContent: mailOptions.html, textContent: mailOptions.text }});
        await nouveauMail.save();

        // Envoi de l'email au responsable
        let info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé au responsable : ' + info.response);
        logHistory(`📧 Email envoyé au responsable pour le endpoint ${endpoint}`, user);
    }

  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email au responsable :', error);
    logHistory(`❌ Échec de l'envoi de l'email au responsable pour le endpoint ${endpoint}`, user);
  }
}

module.exports = responsableMail;
