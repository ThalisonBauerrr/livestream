const mercadopago = require('mercadopago');
const { enviarEmail } = require('./email');
const db = require('../db');  // Conexão com o banco de dados
require('dotenv').config();

// Configuração do Mercado Pago com o access_token
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);

// Função para criar pagamento e gerar QR Code
async function criarPagamentoQR(valor, emailCliente) {
  const payment_data = {
    transaction_amount: Number(valor),
    description: "Acesso à transmissão ao vivo",
    payment_method_id: "pix",
    payer: {
      email: emailCliente,
      first_name: "Cliente",
      last_name: "Futebol"
    }
  };

  try {
    const pagamento = await mercadopago.payment.create(payment_data);
    console.log('Pagamento criado:', pagamento.response);

    // Recupera o QR Code e o payment_id
    const qrCodeBase64 = pagamento.response.point_of_interaction.transaction_data.qr_code_base64;
    const paymentId = pagamento.response.id;

    // Salva no banco de dados sem transação explícita
    db.run(`INSERT INTO pagamentos (payment_id, email, valor, status, data_criacao) VALUES (?, ?, ?, ?, ?)`,
      [paymentId, emailCliente, valor, 'pending', new Date().toLocaleString()],
      function (err) {
        if (err) {
          console.error('Erro ao salvar pagamento no banco de dados:', err.message);
        } else {
          console.log(`Pagamento ${paymentId} salvo com sucesso no banco de dados.`);
        }
      });

    return { qrCodeBase64, paymentId };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
}

async function verificarStatusPagamento(paymentId) {
  //console.log('Verificando o pagamento com ID:', paymentId);

  try {
    // Recupera as informações do pagamento do Mercado Pago
    const pagamento = await mercadopago.payment.get(paymentId);
    const status = pagamento.response.status;

    // Verifica se o pagamento foi aprovado
    if (status === 'approved') {
      // Recupera o e-mail e o status atual do banco de dados, usando o paymentId
      db.get('SELECT email, status FROM pagamentos WHERE payment_id = ?', [paymentId], async (err, row) => {
        if (err) {
          console.error('Erro ao buscar e-mail no banco de dados:', err);
          return;
        }
        
        if (row) {
          const emailCliente = row.email;  // Pega o e-mail do cliente do banco
          const statusBanco = row.status;  // Pega o status atual do banco

          // Verifica se o status no banco ainda é "pending"
          if (statusBanco === 'approved') {
            // Chama a função para enviar o e-mail
            await enviarEmailAprovados(paymentId, emailCliente);
            console.log('E-mail enviado para:', emailCliente);

            // Atualiza o status no banco de dados para "enviado"
            db.run('UPDATE pagamentos SET status = ? WHERE payment_id = ?', ['enviado', paymentId], function (err) {
              if (err) {
                console.error('Erro ao atualizar status para "enviado" no banco de dados:', err);
              } else {
                console.log(`Status do pagamento ${paymentId} atualizado para 'enviado'.`);
              }
            });
          } else {
            console.log(`Status do pagamento ${paymentId} já está como ${statusBanco}. Não enviando o e-mail.`);
          }
        } else {
          console.error('Pagamento não encontrado no banco de dados.');
        }
      });
    } else {
      //console.log(`Status do pagamento ${paymentId} permanece como 'pending'.`);
    }

  } catch (error) {
    console.error('Erro ao consultar o status do pagamento:', error);
  }
}

function verificarPagamentosPendentes() {
  db.all('SELECT payment_id FROM pagamentos', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pagamentos pendentes:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('Nenhum pagamento pendente encontrado.');
    }

    rows.forEach(row => {
      const paymentId = row.payment_id;
      verificarStatusPagamento(paymentId); // Verifica o status do pagamento e atualiza o status no banco
    });
  });
}
async function enviarEmailAprovados(paymentId, emailCliente) {
  try {
    // Envia um e-mail para o cliente aprovado
    await enviarEmail(emailCliente);
    console.log(`E-mail enviado com sucesso para o cliente com payment_id ${paymentId}: ${emailCliente}`);

    // Após o envio do e-mail, atualiza o status para 'enviado' no banco de dados
    db.run(`UPDATE pagamentos SET status = ? WHERE payment_id = ?`, ['enviado', paymentId], function(err) {
      if (err) {
        console.error('Erro ao atualizar status do pagamento no banco de dados:', err);
      } else {
        console.log(`Status do pagamento ${paymentId} atualizado para 'enviado'.`);
      }
    });

  } catch (error) {
    console.error(`Erro ao enviar o e-mail para o pagamento ${paymentId}:`, error);
  }
}

// Verificação a cada 1 minuto (60.000 ms)
setInterval(verificarPagamentosPendentes, 60000)

module.exports = { criarPagamentoQR, verificarStatusPagamento };
