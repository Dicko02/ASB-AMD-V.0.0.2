const nodemailer = require('nodemailer');

//fonction d'envoi de mail
async function mail(object, message) {
    
  // Creation d'un transporteur SMTP (exemple avec Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_MAIL, // Mon email
      pass: process.env.SENDER_MAIL_PASSWORD // Mot de passe ou App Password
    }
  });

  // Configuration du message
  const mailOptions = {
    from: process.env.SENDER_MAIL,
    to: process.env.GETER_MAIL,
    subject: object,
    text: message,
    html: `<p>${message}</p>`
  };

  // Envoi de l'email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé : ' + info.response);
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email :', error);
  }
}

module.exports = mail;
