import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import despesas from '../data/despesas.json';
import ChatRelatorio from '../components/ChatRelatorio';
import './DashboardVendas.css';
import './DashboardDespesas.css';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MESES_NOME = {
  Jan: 'janeiro', Fev: 'fevereiro', Mar: 'março', Abr: 'abril', Mai: 'maio', Jun: 'junho',
  Jul: 'julho', Ago: 'agosto', Set: 'setembro', Out: 'outubro', Nov: 'novembro', Dez: 'dezembro',
};
const CORES = ['#93c5fd', '#1d4ed8', '#9ca3af', '#60a5fa', '#4b5563', '#bfdbfe'];

function anosDisponiveis() {
  const anos = new Set(despesas.map(d => d.ano));
  return Array.from(anos).sort();
}

export default function DashboardDespesas() {
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState(0);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [telaCheia, setTelaCheia] = useState(false);

  const anos = useMemo(anosDisponiveis, []);

  const despesasFiltradas = useMemo(() => {
    return despesas.filter(d => {
      if (ano && d.ano !== ano) return false;
      if (mes && d.mes !== mes) return false;
      if (tipoSelecionado && d.tipo !== tipoSelecionado) return false;
      return true;
    });
  }, [mes, ano, tipoSelecionado]);

  const totalDespesas = despesasFiltradas.reduce((soma, d) => soma + d.valor, 0);
  const valorMaximo = despesasFiltradas.length ? Math.max(...despesasFiltradas.map(d => d.valor)) : 0;
  const valorMinimo = despesasFiltradas.length ? Math.min(...despesasFiltradas.map(d => d.valor)) : 0;
  const valorMedio = despesasFiltradas.length ? totalDespesas / despesasFiltradas.length : 0;

  const porTipo = useMemo(() => {
    const mapa = {};
    despesasFiltradas.forEach(d => {
      mapa[d.tipo] = (mapa[d.tipo] || 0) + d.valor;
    });
    return Object.entries(mapa)
      .map(([tipo, total]) => ({ tipo, total: Number(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [despesasFiltradas]);

  const porMes = useMemo(() => {
    const despesasParaTendencia = despesas.filter(d => {
      if (ano && d.ano !== ano) return false;
      if (tipoSelecionado && d.tipo !== tipoSelecionado) return false;
      return true;
    });
    const mapa = {};
    despesasParaTendencia.forEach(d => {
      mapa[d.mes] = (mapa[d.mes] || 0) + d.valor;
    });
    const mesesComDados = MESES_ABREV.filter(m => mapa[m] !== undefined);
    return mesesComDados.map(m => ({
      mes: m,
      mesCompleto: MESES_NOME[m],
      total: Number((mapa[m] || 0).toFixed(2)),
    }));
  }, [ano, tipoSelecionado]);

  const tabelaDinamica = useMemo(() => {
    const mesesComDados = Array.from(new Set(despesasFiltradas.map(d => d.mes)))
      .sort((a, b) => MESES_ABREV.indexOf(a) - MESES_ABREV.indexOf(b));

    const linhas = {};
    despesasFiltradas.forEach(d => {
      if (!linhas[d.tipo]) linhas[d.tipo] = {};
      linhas[d.tipo][d.mes] = (linhas[d.tipo][d.mes] || 0) + d.valor;
    });

    const totaisPorMes = {};
    mesesComDados.forEach(m => {
      totaisPorMes[m] = Object.values(linhas).reduce((s, l) => s + (l[m] || 0), 0);
    });

    return {
      meses: mesesComDados,
      linhas: Object.entries(linhas).map(([tipo, valores]) => ({
        tipo,
        valores,
        total: Object.values(valores).reduce((s, v) => s + v, 0),
      })).sort((a, b) => b.total - a.total),
      totaisPorMes,
      totalGeral: totalDespesas,
    };
  }, [despesasFiltradas, totalDespesas]);

  const formatoMoeda = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const baseCompleta = useMemo(() => {
    const porTipoGeral = {};
    const porAnoMesGeral = {};
    const porTipoEAnoMes = {};

    despesas.forEach(d => {
      const chaveAnoMes = `${d.ano}-${d.mes}`;
      porTipoGeral[d.tipo] = (porTipoGeral[d.tipo] || 0) + d.valor;
      porAnoMesGeral[chaveAnoMes] = (porAnoMesGeral[chaveAnoMes] || 0) + d.valor;

      const chaveTipoAnoMes = `${d.tipo}|${chaveAnoMes}`;
      porTipoEAnoMes[chaveTipoAnoMes] = (porTipoEAnoMes[chaveTipoAnoMes] || 0) + d.valor;
    });

    const arredonda = obj => Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, Number(v.toFixed(2))])
    );

    return {
      totalGeral: Number(despesas.reduce((s, d) => s + d.valor, 0).toFixed(2)),
      anosDisponiveis: anos,
      tiposDisponiveis: Array.from(new Set(despesas.map(d => d.tipo))),
      totalPorTipoGeral: arredonda(porTipoGeral),
      totalPorAnoMesGeral: arredonda(porAnoMesGeral),
      totalPorTipoEAnoMes: arredonda(porTipoEAnoMes),
    };
  }, [anos]);

  const resumoParaChat = useMemo(() => ({
    filtroAtivoNoDashboard: {
      mes: mes || 'Todos',
      ano: ano || 'Todos',
      tipo: tipoSelecionado || 'Todos',
    },
    visaoFiltradaAtual: {
      totalDespesas: Number(totalDespesas.toFixed(2)),
      valorMaximo: Number(valorMaximo.toFixed(2)),
      valorMinimo: Number(valorMinimo.toFixed(2)),
      valorMedio: Number(valorMedio.toFixed(2)),
      totalPorTipo: porTipo,
      totalPorMes: porMes,
    },
    dadosCompletosSemFiltro: baseCompleta,
  }), [mes, ano, tipoSelecionado, totalDespesas, valorMaximo, valorMinimo, valorMedio, porTipo, porMes, baseCompleta]);

  return (
    <div className={'dv-raiz' + (telaCheia ? ' tela-cheia' : '')}>
      <div className="dv-header">
        <div className="dv-header-esquerda">
          <span className="sidebar-logo-badge">M+</span>
          <span className="dv-header-titulo">Dashboard de Despesas</span>
        </div>
        <div className="dv-header-direita">
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option value="">Todos</option>
            {MESES_ABREV.map(m => <option key={m} value={m}>{m}</option>)}
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

      <div className="dv-kpis dd-kpis-quatro">
        <div className="dv-kpi card">
          <span className="dv-kpi-valor">{formatoMoeda(totalDespesas)}</span>
          <span className="dv-kpi-label">Valor Total</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-valor">{formatoMoeda(valorMaximo)}</span>
          <span className="dv-kpi-label">Máximo</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-valor">{formatoMoeda(valorMedio)}</span>
          <span className="dv-kpi-label">Média</span>
        </div>
        <div className="dv-kpi card">
          <span className="dv-kpi-valor">{formatoMoeda(valorMinimo)}</span>
          <span className="dv-kpi-label">Mínimo</span>
        </div>
      </div>

      {tipoSelecionado && (
        <div className="dv-filtro-ativo">
          Filtrando por tipo: <strong>{tipoSelecionado}</strong>
          <button onClick={() => setTipoSelecionado(null)}>Limpar filtro</button>
        </div>
      )}

      <div className="dv-grafico-card card dv-grafico-tendencia">
        <h3>Valor por mês</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={porMes} margin={{ left: 10, right: 20 }}>
            <defs>
              <linearGradient id="corDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mesCompleto" />
            <YAxis tickFormatter={formatoMoeda} />
            <Tooltip formatter={formatoMoeda} labelFormatter={l => l} />
            <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fill="url(#corDespesa)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="dd-linha-inferior">
        <div className="dv-grafico-card card dd-tabela-dinamica-card">
          <h3>Tipo de despesa</h3>
          {tabelaDinamica.linhas.length === 0 ? (
            <p className="dv-sem-dados">Sem dados no período.</p>
          ) : (
            <div className="dv-tabela-wrap">
              <table className="dv-tabela dd-tabela-dinamica">
                <thead>
                  <tr>
                    <th>Tipo de despesa</th>
                    {tabelaDinamica.meses.map(m => <th key={m}>{m}</th>)}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelaDinamica.linhas.map(l => (
                    <tr
                      key={l.tipo}
                      className="dd-linha-clicavel"
                      onClick={() => setTipoSelecionado(l.tipo)}
                    >
                      <td>{l.tipo}</td>
                      {tabelaDinamica.meses.map(m => (
                        <td key={m}>{l.valores[m] ? formatoMoeda(l.valores[m]) : '-'}</td>
                      ))}
                      <td><strong>{formatoMoeda(l.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total</strong></td>
                    {tabelaDinamica.meses.map(m => (
                      <td key={m}><strong>{formatoMoeda(tabelaDinamica.totaisPorMes[m] || 0)}</strong></td>
                    ))}
                    <td><strong>{formatoMoeda(tabelaDinamica.totalGeral)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="dv-grafico-card card dd-donut-card">
          <h3>Valor por tipo de despesa</h3>
          {porTipo.length === 0 ? (
            <p className="dv-sem-dados">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Pie
                  data={porTipo}
                  dataKey="total"
                  nameKey="tipo"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  cursor="pointer"
                  onClick={d => setTipoSelecionado(d.tipo)}
                  label={({ total, percent }) => `${formatoMoeda(total)} (${(percent * 100).toFixed(2)}%)`}
                >
                  {porTipo.map((entry, i) => (
                    <Cell key={entry.tipo} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={formatoMoeda} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <ChatRelatorio resumo={resumoParaChat} />
    </div>
  );
}
