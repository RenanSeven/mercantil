require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function garantirTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lista (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      idade INT NOT NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

app.post('/api/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const existentes = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existentes.rows.length > 0) {
      return res.status(409).json({ erro: 'Já existe um usuário com este e-mail.' });
    }

    const senhaHash = bcrypt.hashSync(senha, 10);
    await pool.query('INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)', [nome, email, senhaHash]);

    return res.status(201).json({ nome, email });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const linhas = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = linhas.rows[0];
    if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }

    return res.json({ nome: usuario.nome, email: usuario.email });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao autenticar.' });
  }
});

app.get('/api/lista', async (req, res) => {
  try {
    const linhas = await pool.query('SELECT id, nome, idade FROM lista ORDER BY id DESC');
    return res.json(linhas.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar lista.' });
  }
});

app.post('/api/lista', async (req, res) => {
  const { nome, idade } = req.body || {};
  const idadeNum = Number(idade);
  if (!nome || !idade || Number.isNaN(idadeNum) || idadeNum < 0) {
    return res.status(400).json({ erro: 'Nome e idade válidos são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO lista (nome, idade) VALUES ($1, $2) RETURNING id',
      [nome, idadeNum]
    );
    return res.status(201).json({ id: resultado.rows[0].id, nome, idade: idadeNum });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao salvar na lista.' });
  }
});

app.delete('/api/lista/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM lista WHERE id = $1', [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao remover item.' });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const linhas = await pool.query('SELECT id, nome, email, criado_em FROM usuarios ORDER BY id DESC');
    return res.json(linhas.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { pergunta, resumo, historico } = req.body || {};
  if (!pergunta || !resumo) {
    return res.status(400).json({ erro: 'Pergunta e resumo dos dados são obrigatórios.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ erro: 'ANTHROPIC_API_KEY não configurada no servidor.' });
  }

  try {
    const mensagens = [
      ...(Array.isArray(historico) ? historico.slice(-10) : []),
      { role: 'user', content: pergunta },
    ];

    const resposta = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `Você é um assistente que responde perguntas sobre um relatório de BI (pode ser um dashboard de vendas ou de despesas, dependendo da página em que o usuário está). Você recebe um objeto JSON com: "filtroAtivoNoDashboard" (o que está selecionado na tela agora), "visaoFiltradaAtual" (métricas já calculadas para o filtro ativo) e "dadosCompletosSemFiltro" (todos os dados agregados de várias formas, sem respeitar o filtro da tela). As chaves dentro de "dadosCompletosSemFiltro" são nomeadas de forma autoexplicativa (ex: "totalPorVendedorGeral", "totalPorTipoGeral", "totalPorAnoMesGeral"); chaves compostas usam "|" para separar dimensões (ex: "Vendedor|Produto" ou "Tipo|Ano-Mes3letras"). Se a pergunta do usuário se referir a um período, vendedor, produto ou tipo diferente do filtro ativo — ou pedir para cruzar dimensões — calcule a resposta usando "dadosCompletosSemFiltro" em vez da visão filtrada, filtrando/somando as chaves relevantes. "Mais vendido" sem outra especificação deve ser interpretado por quantidade, a menos que a pergunta fale de faturamento/valor. Seja direto, mostre os números e responda em português. Se a pergunta não puder ser respondida com os dados fornecidos, diga isso claramente.\n\nDados do relatório:\n${JSON.stringify(resumo)}`,
      messages: mensagens,
    });

    const texto = resposta.content.find(bloco => bloco.type === 'text')?.text || '';
    return res.json({ resposta: texto });
  } catch (err) {
    console.error('Erro ao consultar IA:', err.message);
    return res.status(500).json({ erro: 'Erro ao consultar a IA.' });
  }
});

app.post('/api/storytelling', async (req, res) => {
  const { dados } = req.body || {};
  if (!dados) {
    return res.status(400).json({ erro: 'Dados do período são obrigatórios.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ erro: 'ANTHROPIC_API_KEY não configurada no servidor.' });
  }

  try {
    const resposta = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 700,
      system: `Você é um analista de vendas que escreve um storytelling curto (2 a 4 parágrafos, ou parágrafos curtos + destaques em lista) sobre o desempenho de um período filtrado num dashboard, em português, tom direto e analítico.

Você recebe um JSON com:
- "periodoAtual" e (se "temComparacao" for true) "periodoAnterior": mês/ano do período.
- "totalAtual" e (se houver) "totalAnterior": faturamento total do período.
- "comparativoVendedores" e "comparativoProdutos": arrays ordenados do maior para o menor "delta" (diferença atual - anterior), com campos "atual", "anterior", "delta" e "deltaPercentual" por vendedor/produto. Quando não há comparação (temComparacao=false), "anterior" é sempre 0 e "delta"="atual" — nesse caso trate como ranking do período atual, não como crescimento.
- "filtroVendedor": se não for null, o dashboard já está filtrado para esse vendedor específico — mencione isso no texto.

Regras:
- Se "temComparacao" for true: compare o total do período atual com o anterior (cresceu ou caiu quanto, em R$ e %). Destaque explicitamente o vendedor que MAIS melhorou (maior delta positivo) e o que MAIS caiu (maior delta negativo, se houver algum vendedor com delta negativo). Faça o mesmo para produtos.
- Se "temComparacao" for false: não fale em "crescimento" ou "queda" nem invente um período anterior. Apenas descreva o desempenho do período atual: total vendido, o vendedor com melhor desempenho, o produto mais vendido, e outros destaques relevantes.
- Use valores em R$ formatados (ex: R$ 1.234,56) e percentuais com uma casa decimal.
- Não invente números fora do que foi fornecido. Se um array vier vazio, diga que não há dados suficientes.
- Não use markdown, apenas texto corrido com quebras de parágrafo.
- IMPORTANTE — marcação de destaque: sempre que citar um número que representa algo positivo (crescimento, delta positivo, melhora, maior valor de um ranking sem comparação), envolva a frase inteira com o número em [[+ e ]], exemplo: [[+cresceu R$ 500,00 (12,3%)]]. Sempre que citar algo negativo (queda, delta negativo, pior desempenho), envolva com [[- e ]], exemplo: [[-caiu R$ 300,00 (8,1%)]]. Use esses marcadores apenas nas partes numéricas/qualitativas de destaque (crescimento/queda), não no texto inteiro.`,
      messages: [{ role: 'user', content: JSON.stringify(dados) }],
    });

    const texto = resposta.content.find(bloco => bloco.type === 'text')?.text || '';
    return res.json({ texto });
  } catch (err) {
    console.error('Erro ao gerar storytelling:', err.message);
    return res.status(500).json({ erro: 'Erro ao gerar storytelling.' });
  }
});

const PORT = process.env.AUTH_PORT || 3333;
garantirTabela()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor de autenticação rodando em http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL:', err);
    process.exit(1);
  });
