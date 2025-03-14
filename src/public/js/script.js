document.getElementById('generateBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value; // Pega o valor do e-mail
  const valor = 1; // Valor fixo para o pagamento (exemplo: R$ 50)

  if (!email) {
    alert("Por favor, insira um e-mail válido.");
    return;
  }

  try {
    // Envia a requisição para o backend (rota POST /payment/create)
    const response = await fetch('/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, valor }) // Envia o e-mail e o valor fixo
    });
    
    const data = await response.json();
    
    // Verifique a resposta do backend
    console.log('Resposta do Backend:', data);

    if (response.ok) {
      if (data.qrCodeBase64) {
        console.log('QR Code Base64 recebido:', data.qrCodeBase64);
        
        // Exibe o QR Code (em base64)
        const qrCodeImage = document.getElementById('qrcodeImage');
        qrCodeImage.src = `data:image/png;base64,${data.qrCodeBase64}`;  // Definindo o QR Code usando a imagem base64
        document.getElementById('qrcodeContainer').style.display = 'block';

        // Exibe o link de pagamento
        document.getElementById('paymentUrl').href = data.paymentUrl;
        document.getElementById('paymentLink').style.display = 'block';
      } else {
        alert('Erro: QR Code não encontrado');
      }
    } else {
      alert('Erro ao gerar QR Code. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao gerar QR Code. Tente novamente.');
  }
});
