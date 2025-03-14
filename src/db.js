const sqlite3 = require('sqlite3').verbose();

// Cria ou abre o banco de dados SQLite
const db = new sqlite3.Database('./src/pagamentos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Cria a tabela de pagamentos se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT NOT NULL,
      data_criacao TEXT NOT NULL
    );
  `);
});

db.configure('busyTimeout', 5000);  // Espera 5 segundos para o banco desbloquear antes de tentar novamente

// Exporte o banco de dados
module.exports = db;
