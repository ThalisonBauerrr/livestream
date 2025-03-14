const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment');
const app = express();

// Configuração para servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paymentPage.html')); // Serve sua página HTML de pagamento
});

// Rota para pagamentos
app.use('/payment', paymentRoutes);

// Inicia o servidor principal
const port = process.env.PORT;
app.listen(port, '0.0.0.0', () => {
  console.log('Aplicação rodando na porta 3003');
});
