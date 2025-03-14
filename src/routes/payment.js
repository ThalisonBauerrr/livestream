const express = require('express');
const { criarPagamentoQR } = require('../services/mercadoPago');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { email, valor } = req.body;
  
  try {
    const { qrCodeBase64, paymentId } = await criarPagamentoQR(valor, email);
    res.json({ qrCodeBase64, paymentId });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar pagamento', error: error.message });
  }
});

module.exports = router;
