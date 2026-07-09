import React from 'react';
import './CaseTecnico.css';

function Codigo({ children }) {
  return <pre className="case-codigo">{children}</pre>;
}

export default function CaseTecnico() {
  return (
    <div className="case-pagina">
      <h1>Case Técnico — Respostas</h1>

      <section className="case-secao card">
        <h2>Seção 1: SQL (MySQL)</h2>

        <h3>Questão 1</h3>
        <p><strong>a. Chaves-primárias da tabela CLIENTE</strong></p>
        <p>COD_PESSOA, COD_AG, DATA_RFC</p>

        <p><strong>b. CPF, nome e sexo de pessoas físicas com sobrenome SILVA</strong></p>
        <Codigo>{`SELECT p.CPF, p.NOME, p.SEXO
FROM PESSOA p
WHERE p.TIPO_PESSOA = 'F'
  AND p.NOME LIKE '%SILVA';`}</Codigo>

        <p><strong>c. Atualizar MAT_GERENTE para 999 onde data de referência &lt; 2025-01-01</strong></p>
        <Codigo>{`UPDATE CLIENTE
SET MAT_GERENTE = 999
WHERE DATA_RFC < '2025-01-01';`}</Codigo>

        <p><strong>d. Quantidade de clientes pessoa jurídica da agência 1000 em 2025-01-01</strong></p>
        <Codigo>{`SELECT COUNT(*) AS QTD_CLIENTES_PJ
FROM CLIENTE c
JOIN PESSOA p ON p.COD_PESSOA = c.COD_PESSOA
WHERE p.TIPO_PESSOA = 'J'
  AND c.COD_AG = 1000
  AND c.DATA_RFC = '2025-01-01';`}</Codigo>

        <h3>Questão 2 — Idade do cliente</h3>
        <Codigo>{`SELECT
    COD_PESSOA,
    NOME,
    CPF,
    DATA_NASCIMENTO,
    TIMESTAMPDIFF(YEAR, DATA_NASCIMENTO, CURDATE()) AS IDADE
FROM PESSOA;`}</Codigo>

        <h3>Questão 3 — COD_AG mais recente por cliente (DATA_RFC)</h3>
        <p>Versão compatível com qualquer MySQL:</p>
        <Codigo>{`SELECT c.COD_PESSOA, c.COD_AG, c.DATA_RFC
FROM CLIENTE c
JOIN (
    SELECT COD_PESSOA, MAX(DATA_RFC) AS MAX_DATA
    FROM CLIENTE
    GROUP BY COD_PESSOA
) ult ON ult.COD_PESSOA = c.COD_PESSOA AND ult.MAX_DATA = c.DATA_RFC;`}</Codigo>
        <p>Versão mais moderna (MySQL 8.0+):</p>
        <Codigo>{`SELECT COD_PESSOA, COD_AG, DATA_RFC
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY COD_PESSOA ORDER BY DATA_RFC DESC) AS rn
    FROM CLIENTE
) t
WHERE rn = 1;`}</Codigo>

        <h3>Questão 4 — Remover duplicatas de clientes priorizando a maior data_atualizacao</h3>
        <p>MySQL 8.0+ (recomendado):</p>
        <Codigo>{`SELECT id_cliente, nome_cliente, email, data_atualizacao
FROM (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY id_cliente
            ORDER BY data_atualizacao DESC
        ) AS rn
    FROM clientes
) t
WHERE rn = 1;`}</Codigo>
        <p>MySQL anterior a 8.0 (sem window functions):</p>
        <Codigo>{`SELECT id_cliente, nome_cliente, email, data_atualizacao
FROM (
    SELECT
        c.*,
        @rn := IF(@prev = id_cliente, @rn + 1, 1) AS rn,
        @prev := id_cliente
    FROM clientes c
    CROSS JOIN (SELECT @rn := 0, @prev := NULL) init
    ORDER BY id_cliente, data_atualizacao DESC
) t
WHERE rn = 1;`}</Codigo>
      </section>

      <section className="case-secao card">
        <h2>Seção 2: Power BI</h2>

        <h3>Questão 1 — Diferença entre Medida e Coluna</h3>
        <p><strong>Coluna:</strong> valor calculado linha a linha e armazenado fisicamente no modelo.</p>
        <p><strong>Medida:</strong> cálculo em DAX avaliado dinamicamente, conforme o contexto de filtro.</p>

        <h3>Questão 2 — Média de salário de clientes do sexo feminino</h3>
        <Codigo>{`Media Salario Feminino =
CALCULATE(
    AVERAGE(Tabela[SALARIO]),
    Tabela[SEXO] = "F"
)`}</Codigo>
      </section>

      <section className="case-secao card">
        <h2>Seção 3: Análise de Dados</h2>

        <h3>Questão 1 — Insight estratégico</h3>
        <img
          src="/imagens/desempenho-vendas.jpeg"
          alt="Gráfico de desempenho de vendas: receita mensal, novos clientes e ticket médio ao longo de 12 meses"
          className="case-imagem"
        />
        <p>
          Ao longo dos 12 meses, as vendas seguiram uma trajetória de crescimento constante, e a empresa
          cresceu cerca de 4x em um ano, acompanhando o aumento do ticket médio, que praticamente triplicou
          no período. Enquanto isso, o número de clientes se manteve constante, sem crescimento proporcional
          ao da receita. Ou seja, o crescimento foi impulsionado majoritariamente pelo aumento do valor médio
          gasto por cliente, e não pela expansão da base de clientes: a aquisição de novos clientes é o
          "gargalo" do crescimento futuro.
        </p>
        <p>
          Não é possível afirmar com certeza o motivo desse aumento no ticket médio sem manter a quantidade
          de clientes, mas existem duas hipóteses principais. A primeira é que a base de clientes se renovou
          (novos clientes entraram enquanto outros saíram, mantendo a mesma quantidade total), e esses novos
          clientes têm um poder aquisitivo maior. A segunda é que os mesmos clientes passaram a consumir
          mais ao longo do período. De qualquer forma, isso mostra que, com uma estratégia de marketing focada
          em captação, independente de qual seja o cenário real, o crescimento pode ser ainda maior no ano
          seguinte.
        </p>
      </section>

      <section className="case-secao card">
        <h2>Seção 4: Python</h2>

        <h3>Questão 4</h3>
        <p><strong>a. Filtrar últimos 30 dias</strong></p>
        <Codigo>{`df['data'] = pd.to_datetime(df['data'])  # garante que é datetime
data_limite = df['data'].max() - pd.Timedelta(days=30)
df_filtrado = df[df['data'] >= data_limite]`}</Codigo>

        <p><strong>b. Agrupar por vendedor e somar</strong></p>
        <Codigo>{`vendas_por_vendedor = df_filtrado.groupby('vendedor')['valor'].sum()`}</Codigo>

        <p><strong>c. Top 3 vendedores</strong></p>
        <Codigo>{`top3 = vendas_por_vendedor.sort_values(ascending=False).head(3)`}</Codigo>
      </section>
    </div>
  );
}
