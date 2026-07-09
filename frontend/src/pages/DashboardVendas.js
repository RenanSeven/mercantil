import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import vendas from '../data/vendas.json';
import despesas from '../data/despesas.json';
import ChatRelatorio from '../components/ChatRelatorio';
import ModalStorytelling from '../components/ModalStorytelling';
import './DashboardVendas.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3333');

const MESES = [
  { valor: 0, nome: 'Todos' },
  { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' },
];

const CORES = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'];

function anosDisponiveis() {
  const anos = new Set(vendas.map(v => Number(v.data_venda.slice(0, 4))));
  return Array.from(anos).sort();
}

export default function DashboardVendas() {
  const [mes, setMes] = useState(0);
  const [ano, setAno] = useState(0);
  const [vendedorSelecionado, setVendedorSelecionado] = useState(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const [storyAberto, setStoryAberto] = useState(false);
  const [storyCarregando, setStoryCarregando] = useState(false);
  const [storyTexto, setStoryTexto] = useState('');
  const [storyErro, setStoryErro] = useState('');

  const anos = useMemo(anosDisponiveis, []);

  const vendasFiltradas = useMemo(() => {
    return vendas.filter(v => {
      const [anoV, mesV] = v.data_venda.split('-').map(Number);
      if (ano && anoV !== ano) return false;
      if (mes && mesV !== mes) return false;
      if (vendedorSelecionado && v.vendedor !== vendedorSelecionado) return false;
      return true;
    });
  }, [mes, ano, vendedorSelecionado]);

  const totalVendido = vendasFiltradas.reduce((soma, v) => soma + v.total, 0);
  const qtdeTotal = vendasFiltradas.reduce((soma, v) => soma + v.qtde, 0);
  const ticketMedio = vendasFiltradas.length ? totalVendido / vendasFiltradas.length : 0;

  const despesasFiltradas = useMemo(() => {
    const mesAbrev = mes ? MESES.find(m => m.valor === mes)?.nome.slice(0, 3) : null;
    return despesas.filter(d => {
      if (ano && d.ano !== ano) return false;
      if (mesAbrev && d.mes !== mesAbrev) return false;
      return true;
    });
  }, [mes, ano]);

  const totalDespesas = despesasFiltradas.reduce((soma, d) => soma + d.valor, 0);

  const porVendedor = useMemo(() => {
    const mapa = {};
    vendasFiltradas.forEach(v => {
      mapa[v.vendedor] = (mapa[v.vendedor] || 0) + v.total;
    });
    return Object.entries(mapa)
      .map(([vendedor, total]) => ({ vendedor, total: Number(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [vendasFiltradas]);

  const porProduto = useMemo(() => {
    const mapa = {};
    vendasFiltradas.forEach(v => {
      mapa[v.produto] = (mapa[v.produto] || 0) + v.total;
    });
    return Object.entries(mapa)
      .map(([produto, total]) => ({ produto, total: Number(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [vendasFiltradas]);

  const porMes = useMemo(() => {
    const vendasParaTendencia = vendas.filter(v => {
      const [anoV] = v.data_venda.split('-').map(Number);
      if (ano && anoV !== ano) return false;
      if (vendedorSelecionado && v.vendedor !== vendedorSelecionado) return false;
      return true;
    });
    const mapa = {};
    vendasParaTendencia.forEach(v => {
      const mesV = Number(v.data_venda.split('-')[1]);
      mapa[mesV] = (mapa[mesV] || 0) + v.total;
    });
    return MESES.filter(m => m.valor !== 0).map(m => ({
      mes: m.nome.slice(0, 3),
      total: Number((mapa[m.valor] || 0).toFixed(2)),
    }));
  }, [ano, vendedorSelecionado]);

  const baseCompleta = useMemo(() => {
    const porVendedorGeral = {};
    const porProdutoGeral = {};
    const porAnoMesGeral = {};
    const porVendedorAnoMes = {};
    const porVendedorProduto = {};
    const porVendedorProdutoQtde = {};

    vendas.forEach(v => {
      const [anoV, mesV] = v.data_venda.split('-').map(Number);
      const chaveAnoMes = `${anoV}-${String(mesV).padStart(2, '0')}`;

      porVendedorGeral[v.vendedor] = (porVendedorGeral[v.vendedor] || 0) + v.total;
      porProdutoGeral[v.produto] = (porProdutoGeral[v.produto] || 0) + v.total;
      porAnoMesGeral[chaveAnoMes] = (porAnoMesGeral[chaveAnoMes] || 0) + v.total;

      const chaveVendedorAnoMes = `${v.vendedor}|${chaveAnoMes}`;
      porVendedorAnoMes[chaveVendedorAnoMes] = (porVendedorAnoMes[chaveVendedorAnoMes] || 0) + v.total;

      const chaveVendedorProduto = `${v.vendedor}|${v.produto}`;
      porVendedorProduto[chaveVendedorProduto] = (porVendedorProduto[chaveVendedorProduto] || 0) + v.total;
      porVendedorProdutoQtde[chaveVendedorProduto] = (porVendedorProdutoQtde[chaveVendedorProduto] || 0) + v.qtde;
    });

    const arredonda = obj => Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, Number(v.toFixed(2))])
    );

    const porTipoDespesaGeral = {};
    const porAnoMesDespesaGeral = {};
    const porTipoEAnoMesDespesa = {};

    despesas.forEach(d => {
      const chaveAnoMes = `${d.ano}-${d.mes}`;
      porTipoDespesaGeral[d.tipo] = (porTipoDespesaGeral[d.tipo] || 0) + d.valor;
      porAnoMesDespesaGeral[chaveAnoMes] = (porAnoMesDespesaGeral[chaveAnoMes] || 0) + d.valor;

      const chaveTipoAnoMes = `${d.tipo}|${chaveAnoMes}`;
      porTipoEAnoMesDespesa[chaveTipoAnoMes] = (porTipoEAnoMesDespesa[chaveTipoAnoMes] || 0) + d.valor;
    });

    return {
      totalGeral: Number(vendas.reduce((s, v) => s + v.total, 0).toFixed(2)),
      quantidadeGeral: vendas.reduce((s, v) => s + v.qtde, 0),
      anosDisponiveis: anos,
      vendedoresDisponiveis: Array.from(new Set(vendas.map(v => v.vendedor))),
      produtosDisponiveis: Array.from(new Set(vendas.map(v => v.produto))),
      totalPorVendedorGeral: arredonda(porVendedorGeral),
      totalPorProdutoGeral: arredonda(porProdutoGeral),
      totalPorAnoMesGeral: arredonda(porAnoMesGeral),
      totalPorVendedorEAnoMes: arredonda(porVendedorAnoMes),
      totalPorVendedorEProdutoValor: arredonda(porVendedorProduto),
      totalPorVendedorEProdutoQtde: porVendedorProdutoQtde,
      despesas: {
        totalGeral: Number(despesas.reduce((s, d) => s + d.valor, 0).toFixed(2)),
        tiposDisponiveis: Array.from(new Set(despesas.map(d => d.tipo))),
        totalPorTipoGeral: arredonda(porTipoDespesaGeral),
        totalPorAnoMesGeral: arredonda(porAnoMesDespesaGeral),
        totalPorTipoEAnoMes: arredonda(porTipoEAnoMesDespesa),
      },
    };
  }, [anos]);

  const resumoParaChat = useMemo(() => ({
    filtroAtivoNoDashboard: {
      mes: MESES.find(m => m.valor === mes)?.nome || 'Todos',
      ano: ano || 'Todos',
      vendedor: vendedorSelecionado || 'Todos',
    },
    visaoFiltradaAtual: {
      totalVendido: Number(totalVendido.toFixed(2)),
      quantidadeVendida: qtdeTotal,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      totalDespesas: Number(totalDespesas.toFixed(2)),
      lucroLiquido: Number((totalVendido - totalDespesas).toFixed(2)),
      totalPorVendedor: porVendedor,
      totalPorProduto: porProduto,
      totalPorMes: porMes,
    },
    dadosCompletosSemFiltro: baseCompleta,
  }), [mes, ano, vendedorSelecionado, totalVendido, qtdeTotal, ticketMedio, totalDespesas, porVendedor, porProduto, porMes, baseCompleta]);

  const vendasOrdenadas = useMemo(() => {
    return [...vendasFiltradas].sort((a, b) => b.data_venda.localeCompare(a.data_venda));
  }, [vendasFiltradas]);

  const formatoMoeda = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatoData = data => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  function periodoAnterior() {
    if (!ano) return null;
    if (mes) {
      const mesAnt = mes === 1 ? 12 : mes - 1;
      const anoAnt = mes === 1 ? ano - 1 : ano;
      return { mes: mesAnt, ano: anoAnt };
    }
    return { mes: 0, ano: ano - 1 };
  }

  function comparativoPor(campo, vendasA, vendasB) {
    const mapaA = {};
    vendasA.forEach(v => { mapaA[v[campo]] = (mapaA[v[campo]] || 0) + v.total; });
    const mapaB = {};
    vendasB.forEach(v => { mapaB[v[campo]] = (mapaB[v[campo]] || 0) + v.total; });

    const chaves = new Set([...Object.keys(mapaA), ...Object.keys(mapaB)]);
    return Array.from(chaves).map(chave => {
      const atual = Number((mapaA[chave] || 0).toFixed(2));
      const anterior = Number((mapaB[chave] || 0).toFixed(2));
      const delta = Number((atual - anterior).toFixed(2));
      const deltaPercentual = anterior > 0
        ? Number(((delta / anterior) * 100).toFixed(1))
        : (atual > 0 ? 100 : 0);
      return { [campo]: chave, atual, anterior, delta, deltaPercentual };
    }).sort((a, b) => b.delta - a.delta);
  }

  async function abrirStorytelling() {
    setStoryAberto(true);
    setStoryCarregando(true);
    setStoryErro('');
    setStoryTexto('');

    try {
      const anterior = periodoAnterior();
      const nomeMesAtual = MESES.find(m => m.valor === mes)?.nome || 'Todos';

      const vendasPeriodoAtual = vendas.filter(v => {
        const [anoV, mesV] = v.data_venda.split('-').map(Number);
        if (ano && anoV !== ano) return false;
        if (mes && mesV !== mes) return false;
        return true;
      });

      let payload = {
        temComparacao: false,
        filtroVendedor: vendedorSelecionado || null,
        periodoAtual: { mes: nomeMesAtual, ano: ano || 'Todos' },
        totalAtual: Number(vendasPeriodoAtual.reduce((s, v) => s + v.total, 0).toFixed(2)),
        comparativoVendedores: comparativoPor('vendedor', vendasFiltradas, []),
        comparativoProdutos: comparativoPor('produto', vendasFiltradas, []),
      };

      if (anterior) {
        const vendasPeriodoAnterior = vendas.filter(v => {
          const [anoV, mesV] = v.data_venda.split('-').map(Number);
          if (anterior.ano && anoV !== anterior.ano) return false;
          if (anterior.mes && mesV !== anterior.mes) return false;
          return true;
        });

        if (vendasPeriodoAnterior.length > 0) {
          const nomeMesAnterior = MESES.find(m => m.valor === anterior.mes)?.nome || 'Todos';
          payload = {
            temComparacao: true,
            filtroVendedor: vendedorSelecionado || null,
            periodoAtual: { mes: nomeMesAtual, ano: ano || 'Todos' },
            periodoAnterior: { mes: nomeMesAnterior, ano: anterior.ano },
            totalAtual: Number(vendasPeriodoAtual.reduce((s, v) => s + v.total, 0).toFixed(2)),
            totalAnterior: Number(vendasPeriodoAnterior.reduce((s, v) => s + v.total, 0).toFixed(2)),
            comparativoVendedores: comparativoPor('vendedor', vendasPeriodoAtual, vendasPeriodoAnterior),
            comparativoProdutos: comparativoPor('produto', vendasPeriodoAtual, vendasPeriodoAnterior),
          };
        }
      }

      const res = await fetch(`${API_URL}/api/storytelling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: payload }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Erro ao gerar storytelling.');
      setStoryTexto(dados.texto);
    } catch (err) {
      setStoryErro(err.message);
    } finally {
      setStoryCarregando(false);
    }
  }

  return (
    <div className={'dv-raiz' + (telaCheia ? ' tela-cheia' : '')}>
      <div className="dv-header">
        <div className="dv-header-esquerda">
          <span className="sidebar-logo-badge">M+</span>
          <span className="dv-header-titulo">Dashboard de Vendas</span>
        </div>
        <div className="dv-header-direita">
          <select value={mes} onChange={e => setMes(Number(e.target.value))}>
            {MESES.map(m => <option key={m.valor} value={m.valor}>{m.nome}</option>)}
          </select>
          <select value={ano} onChange={e => setAno(Number(e.target.value))}>
            <option value={0}>Todos</option>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button className="dv-botao-tela-cheia" onClick={() => setTelaCheia(v => !v)} title="Tela cheia">
            {telaCheia ? '🗗' : '⛶'}
          </button>
        </div>
      </div>

      <div className="dv-kpis">
        <div className="dv-kpi card">
          <span className="dv-kpi-label">Total vendido</span>
          <span className="dv-kpi-valor">{formatoMoeda(totalVendido)}</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-label">Quantidade vendida</span>
          <span className="dv-kpi-valor">{qtdeTotal}</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-label">Ticket médio</span>
          <span className="dv-kpi-valor">{formatoMoeda(ticketMedio)}</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-label">Despesas</span>
          <span className="dv-kpi-valor">{formatoMoeda(totalDespesas)}</span>
        </div>
      </div>

      {vendedorSelecionado && (
        <div className="dv-filtro-ativo">
          Filtrando por vendedor: <strong>{vendedorSelecionado}</strong>
          <button onClick={() => setVendedorSelecionado(null)}>Limpar filtro</button>
        </div>
      )}

      <div className="dv-grafico-card card dv-grafico-tendencia">
        <h3>Vendas por mês</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={porMes} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={formatoMoeda} />
            <Tooltip formatter={formatoMoeda} />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dv-graficos">
        <div className="dv-grafico-card card">
          <h3>Vendas por vendedor</h3>
          {porVendedor.length === 0 ? (
            <p className="dv-sem-dados">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porVendedor} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatoMoeda} />
                <YAxis type="category" dataKey="vendedor" width={100} />
                <Tooltip formatter={formatoMoeda} />
                <Bar
                  dataKey="total"
                  radius={[0, 6, 6, 0]}
                  cursor="pointer"
                  onClick={d => setVendedorSelecionado(d.vendedor)}
                >
                  {porVendedor.map((entry, i) => (
                    <Cell key={entry.vendedor} fill={CORES[i % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dv-grafico-card card">
          <h3>Vendas por produto</h3>
          {porProduto.length === 0 ? (
            <p className="dv-sem-dados">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porProduto} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatoMoeda} />
                <YAxis type="category" dataKey="produto" width={100} />
                <Tooltip formatter={formatoMoeda} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {porProduto.map((entry, i) => (
                    <Cell key={entry.produto} fill={CORES[i % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dv-grafico-card card dv-tabela-card">
        <div className="dv-tabela-cabecalho">
          <h3>Detalhes das vendas</h3>
          <button className="dv-botao-storytelling" onClick={abrirStorytelling}>
            📖 Storytelling
          </button>
        </div>
        {vendasOrdenadas.length === 0 ? (
          <p className="dv-sem-dados">Sem dados no período.</p>
        ) : (
          <div className="dv-tabela-wrap">
            <table className="dv-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Vendedor</th>
                  <th>Produto</th>
                  <th>Qtde</th>
                  <th>Preço unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {vendasOrdenadas.map(v => (
                  <tr key={v.id}>
                    <td>{formatoData(v.data_venda)}</td>
                    <td>{v.vendedor}</td>
                    <td>{v.produto}</td>
                    <td>{v.qtde}</td>
                    <td>{formatoMoeda(v.preco_unit)}</td>
                    <td>{formatoMoeda(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ChatRelatorio resumo={resumoParaChat} />

      <ModalStorytelling
        aberto={storyAberto}
        onFechar={() => setStoryAberto(false)}
        carregando={storyCarregando}
        texto={storyTexto}
        erro={storyErro}
        subtitulo={`${MESES.find(m => m.valor === mes)?.nome || 'Todos'} / ${ano || 'Todos'}${vendedorSelecionado ? ' · ' + vendedorSelecionado : ''}`}
      />
    </div>
  );
}
