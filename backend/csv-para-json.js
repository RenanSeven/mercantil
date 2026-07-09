require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const OUT_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'vendas.json');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.query(
    'SELECT id, vendedor, produto, qtde, preco_unit, data_venda FROM base_dados ORDER BY data_venda'
  );

  const vendas = rows.map(r => ({
    id: r.id,
    vendedor: r.vendedor,
    produto: r.produto,
    qtde: r.qtde,
    preco_unit: Number(r.preco_unit),
    total: Number((r.qtde * r.preco_unit).toFixed(2)),
    data_venda: r.data_venda.toISOString().slice(0, 10),
  }));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(vendas, null, 2));

  console.log(`Exportado ${vendas.length} registros de vendas para ${OUT_PATH}`);
  await conn.end();
}

main().catch(err => {
  console.error('Erro ao exportar dados:', err.message);
  process.exit(1);
});
