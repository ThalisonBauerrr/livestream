const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function enviarEmail(destinatario) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: '🎥 Acesso Liberado: Jogo Ao Vivo - Transmissão Exclusiva! ⚽🔥',
    text: `
  Olá!
  
  Seu acesso exclusivo à transmissão AO VIVO do jogo já está liberado! ⚽🎥
  
  Clique no link abaixo para assistir agora mesmo:
  👉 https://link-do-grupo.com
  
  ⚠️ Lembre-se: o acesso é exclusivo e pode expirar a qualquer momento, então não perca tempo!
  
  Bom jogo e boa diversão! 🎉
  
  Atenciosamente,  
  Equipe de Transmissão Esportiva
    `
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { enviarEmail };
