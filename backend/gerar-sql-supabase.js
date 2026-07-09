require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function escapar(valor) {
  if (valor === null || valor === undefined) return 'NULL';
  if (typeof valor === 'number') return String(valor);
  if (valor instanceof Date) return `'${valor.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(valor).replace(/'/g, "''")}'`;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  let sql = '';

  sql += `-- BASE_DADOS (vendas)\n`;
  sql += `CREATE TABLE IF NOT EXISTS base_dados (\n`;
  sql += `  id INT PRIMARY KEY,\n`;
  sql += `  vendedor VARCHAR(50),\n`;
  sql += `  produto VARCHAR(50),\n`;
  sql += `  qtde INT,\n`;
  sql += `  preco_unit DECIMAL(10,2),\n`;
  sql += `  data_venda DATE\n`;
  sql += `);\n\n`;
  const [vendas] = await conn.query('SELECT id, vendedor, produto, qtde, preco_unit, data_venda FROM base_dados');
  for (const v of vendas) {
    sql += `INSERT INTO base_dados (id, vendedor, produto, qtde, preco_unit, data_venda) VALUES (${escapar(v.id)}, ${escapar(v.vendedor)}, ${escapar(v.produto)}, ${escapar(v.qtde)}, ${escapar(v.preco_unit)}, ${escapar(v.data_venda)});\n`;
  }

  sql += `\n-- DESPESAS\n`;
  sql += `CREATE TABLE IF NOT EXISTS despesas (\n`;
  sql += `  id INT PRIMARY KEY,\n`;
  sql += `  tipo VARCHAR(20),\n`;
  sql += `  mes VARCHAR(3),\n`;
  sql += `  ano INT,\n`;
  sql += `  valor DECIMAL(10,2)\n`;
  sql += `);\n\n`;
  const [despesas] = await conn.query('SELECT id, tipo, mes, ano, valor FROM despesas');
  for (const d of despesas) {
    sql += `INSERT INTO despesas (id, tipo, mes, ano, valor) VALUES (${escapar(d.id)}, ${escapar(d.tipo)}, ${escapar(d.mes)}, ${escapar(d.ano)}, ${escapar(d.valor)});\n`;
  }

  sql += `\n-- PESSOA\n`;
  sql += `CREATE TABLE IF NOT EXISTS pessoa (\n`;
  sql += `  cod_pessoa INT PRIMARY KEY,\n`;
  sql += `  tipo_pessoa VARCHAR(1),\n`;
  sql += `  nome VARCHAR(100),\n`;
  sql += `  cpf VARCHAR(11),\n`;
  sql += `  cnpj VARCHAR(14),\n`;
  sql += `  sexo VARCHAR(1),\n`;
  sql += `  estado_civil VARCHAR(20),\n`;
  sql += `  data_nascimento DATE\n`;
  sql += `);\n\n`;
  const [pessoas] = await conn.query('SELECT * FROM pessoa');
  for (const p of pessoas) {
    sql += `INSERT INTO pessoa (cod_pessoa, tipo_pessoa, nome, cpf, cnpj, sexo, estado_civil, data_nascimento) VALUES (${escapar(p.COD_PESSOA)}, ${escapar(p.TIPO_PESSOA)}, ${escapar(p.NOME)}, ${escapar(p.CPF)}, ${escapar(p.CNPJ)}, ${escapar(p.SEXO)}, ${escapar(p.ESTADO_CIVIL)}, ${escapar(p.DATA_NASCIMENTO)});\n`;
  }

  sql += `\n-- CLIENTE\n`;
  sql += `CREATE TABLE IF NOT EXISTS cliente (\n`;
  sql += `  cod_pessoa INT,\n`;
  sql += `  cod_ag INT,\n`;
  sql += `  data_rfc DATE,\n`;
  sql += `  mat_gerente INT\n`;
  sql += `);\n\n`;
  const [clientesRel] = await conn.query('SELECT * FROM cliente');
  for (const c of clientesRel) {
    sql += `INSERT INTO cliente (cod_pessoa, cod_ag, data_rfc, mat_gerente) VALUES (${escapar(c.COD_PESSOA)}, ${escapar(c.COD_AG)}, ${escapar(c.DATA_RFC)}, ${escapar(c.MAT_GERENTE)});\n`;
  }

  sql += `\n-- CLIENTES (id_cliente se repete de propósito, não é chave única)\n`;
  sql += `CREATE TABLE IF NOT EXISTS clientes (\n`;
  sql += `  id_cliente INT,\n`;
  sql += `  nome_cliente VARCHAR(100),\n`;
  sql += `  email VARCHAR(100),\n`;
  sql += `  data_atualizacao DATE\n`;
  sql += `);\n\n`;
  const [clientes] = await conn.query('SELECT * FROM clientes');
  for (const c of clientes) {
    sql += `INSERT INTO clientes (id_cliente, nome_cliente, email, data_atualizacao) VALUES (${escapar(c.id_cliente)}, ${escapar(c.nome_cliente)}, ${escapar(c.email)}, ${escapar(c.data_atualizacao)});\n`;
  }

  sql += `\n-- USUARIOS (login do sistema)\n`;
  sql += `CREATE TABLE IF NOT EXISTS usuarios (\n`;
  sql += `  id SERIAL PRIMARY KEY,\n`;
  sql += `  nome VARCHAR(100) NOT NULL,\n`;
  sql += `  email VARCHAR(100) NOT NULL UNIQUE,\n`;
  sql += `  senha_hash VARCHAR(255) NOT NULL,\n`;
  sql += `  criado_em TIMESTAMP NOT NULL DEFAULT NOW()\n`;
  sql += `);\n\n`;
  const [usuarios] = await conn.query('SELECT * FROM usuarios');
  for (const u of usuarios) {
    sql += `INSERT INTO usuarios (nome, email, senha_hash, criado_em) VALUES (${escapar(u.nome)}, ${escapar(u.email)}, ${escapar(u.senha_hash)}, ${escapar(u.criado_em)});\n`;
  }

  sql += `\n-- LISTA (formulário nomes/idades)\n`;
  sql += `CREATE TABLE IF NOT EXISTS lista (\n`;
  sql += `  id SERIAL PRIMARY KEY,\n`;
  sql += `  nome VARCHAR(100) NOT NULL,\n`;
  sql += `  idade INT NOT NULL,\n`;
  sql += `  criado_em TIMESTAMP NOT NULL DEFAULT NOW()\n`;
  sql += `);\n\n`;
  const [lista] = await conn.query('SELECT * FROM lista');
  for (const l of lista) {
    sql += `INSERT INTO lista (nome, idade, criado_em) VALUES (${escapar(l.nome)}, ${escapar(l.idade)}, ${escapar(l.criado_em)});\n`;
  }

  const destino = path.join(__dirname, 'supabase-import.sql');
  fs.writeFileSync(destino, sql);
  console.log(`Arquivo gerado em: ${destino}`);
  await conn.end();
}

main().catch(err => {
  console.error('Erro ao gerar SQL:', err.message);
  process.exit(1);
});
