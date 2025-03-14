require('dotenv').config();
const { criarPagamentoQR } = require('./services/mercadoPago');
const fs = require('fs');

(async () => {
  try {
    const qrCodeBase64 = await criarPagamentoQR(10.00, 'cliente@gmail.com'); // Ex.: R$10,00
    fs.writeFileSync('qrcode.png', Buffer.from(qrCodeBase64, 'base64'));
    console.log('QR Code gerado com sucesso em qrcode.png');
  } catch (error) {
    console.error('Erro ao gerar QR Code', error);
  }
})();
