const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db');  // Conexão com o banco de dados
const { enviarEmail } = require('./email');
const { verificarStatusPagamento } = require('./services/mercadopago');
const app = express();

app.use(bodyParser.json());

// Rota do Webhook para receber notificações do Mercado Pago
app.post('/webhook', async (req, res) => {
  const paymentId = req.body.data.id; // O ID do pagamento enviado pelo Mercado Pago
  const status = req.body.data.status;
  const emailCliente = req.body.data.payer.email;

  try {
    // Atualiza o status do pagamento no banco de dados
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      if (status === 'approved') {
        db.run(`UPDATE pagamentos SET status = ? WHERE payment_id = ?`, ['enviado', paymentId], function(err) {
          if (err) {
            console.error('Erro ao atualizar status do pagamento no banco de dados:', err);
            db.run('ROLLBACK');  // Desfaz a transação se ocorrer erro
          } else {
            console.log(`Status do pagamento ${paymentId} atualizado para 'enviado'.`);

            // Envia um e-mail para o cliente
            enviarEmail(emailCliente)
              .then(() => {
                console.log('E-mail enviado com sucesso para:', emailCliente);
              })
              .catch((error) => {
                console.error('Erro ao enviar o e-mail:', error);
              });

            db.run('COMMIT');  // Commit da transação após sucesso
          }
        });
      } else {
        db.run(`UPDATE pagamentos SET status = ? WHERE payment_id = ?`, ['pending', paymentId], function(err) {
          if (err) {
            console.error('Erro ao atualizar status do pagamento no banco de dados:', err);
            db.run('ROLLBACK');  // Desfaz a transação se ocorrer erro
          } else {
            console.log(`Status do pagamento ${paymentId} permanece como 'pending'.`);
            db.run('COMMIT');  // Commit da transação após sucesso
          }
        });
      }
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro ao processar webhook');
  }
});

// Inicia o servidor webhook na porta 3001
const port = 3001;
app.listen(port, () => {
  console.log(`Servidor webhook rodando na porta ${port}`);
});
