require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const OUT_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'despesas.json');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.query(
    'SELECT id, tipo, mes, ano, valor FROM despesas ORDER BY ano, mes'
  );

  const despesas = rows.map(r => ({
    id: r.id,
    tipo: r.tipo,
    mes: r.mes,
    ano: r.ano,
    valor: Number(r.valor),
  }));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(despesas, null, 2));

  console.log(`Exportado ${despesas.length} registros de despesas para ${OUT_PATH}`);
  await conn.end();
}

main().catch(err => {
  console.error('Erro ao exportar despesas:', err.message);
  process.exit(1);
});
