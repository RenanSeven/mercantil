import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DASHBOARDS = [
  {
    rota: '/dashboard/vendas',
    nome: 'Vendas',
    descricao: 'Visão geral de vendas por vendedor, produto e período.',
    icone: '📈',
  },
  {
    rota: '/dashboard/despesas',
    nome: 'Despesas',
    descricao: 'Visão geral de despesas por tipo e período.',
    icone: '💸',
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-menu">
      <h1>Dashboard</h1>
      <div className="dashboard-menu-grid">
        {DASHBOARDS.map(d => (
          <div key={d.rota} className="dashboard-menu-card card">
            <div className="dashboard-menu-icone">{d.icone}</div>
            <h2>{d.nome}</h2>
            <p>{d.descricao}</p>
            <Link to={d.rota} className="dashboard-menu-botao">Acessar Dashboard</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
