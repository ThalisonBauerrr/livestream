require('dotenv').config();
const { enviarEmail } = require('./services/email');

enviarEmail('thalisonbauer@hotmail.com')
  .then(() => console.log('E-mail enviado com sucesso!'))
  .catch(console.error);
