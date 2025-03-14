const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment');
const app = express();

// Configuração para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para processar o corpo da requisição
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal - Serve a página de pagamento
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paymentPage.html'));
});

// Rota para pagamentos
app.use('/payment', paymentRoutes);

// Rota para /livestream - Serve a mesma página de pagamento
app.get('/livestream', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paymentPage.html'));  // Serve a mesma página de pagamento
});

// Inicia o servidor na porta 3003
const port = process.env.PORT || 3003;  // Usa a porta configurada no ambiente ou a porta 3003 como fallback
app.listen(port, '0.0.0.0', () => {
  console.log(`Aplicação rodando na porta ${port}`);
});
