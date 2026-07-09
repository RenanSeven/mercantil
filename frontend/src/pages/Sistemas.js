import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const SISTEMAS = [
  {
    rota: '/sistemas/lista-nomes',
    nome: 'Lista de Nomes',
    descricao: 'Consulta de nomes cadastrados.',
    icone: '📋',
  },
  {
    rota: '/sistemas/contador',
    nome: 'Contador',
    descricao: 'Conta quantas linhas tem um arquivo .txt.',
    icone: '🔢',
  },
];

export default function Sistemas() {
  return (
    <div className="dashboard-menu">
      <h1>Sistemas</h1>
      <div className="dashboard-menu-grid">
        {SISTEMAS.map(s => (
          <div key={s.nome} className="dashboard-menu-card card">
            <div className="dashboard-menu-icone">{s.icone}</div>
            <h2>{s.nome}</h2>
            <p>{s.descricao}</p>
            <Link to={s.rota} className="dashboard-menu-botao">Acessar sistema</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
