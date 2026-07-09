require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [tables] = await conn.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0] || {})[0];
  console.log('Tabelas encontradas em', process.env.DB_NAME, ':');

  for (const row of tables) {
    const tableName = row[tableKey];
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const [countRows] = await conn.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
    console.log(`\n=== ${tableName} (${countRows[0].total} linhas) ===`);
    cols.forEach(c => console.log(` - ${c.Field} (${c.Type})`));
  }

  await conn.end();
}

main().catch(err => {
  console.error('Erro ao conectar/inspecionar:', err.message);
  process.exit(1);
});
