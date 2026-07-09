import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function IconePowerBI() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="5" height="11" rx="1" fill="#F2C811" />
      <rect x="9.5" y="6" width="5" height="15" rx="1" fill="#D9A400" />
      <rect x="17" y="2" width="5" height="19" rx="1" fill="#F2C811" />
    </svg>
  );
}

const ITENS = [
  { to: '/dashboard', label: 'Dashboard', icone: '📊' },
  { to: '/sistemas', label: 'Sistemas', icone: '🖥️' },
  { to: '/power-bi', label: 'Power BI', icone: <IconePowerBI /> },
  { to: '/case-tecnico', label: 'Case Técnico', icone: '📝' },
  { to: '/acessos', label: 'Acessos', icone: '🔑' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/imagens/logo-mercantil-branco.png" alt="Mercantil" className="sidebar-logo-imagem" />
      </div>
      <nav className="sidebar-nav">
        {ITENS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' ativo' : '')}
          >
            <span className="nav-icone">{item.icone}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
