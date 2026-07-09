import React, { useEffect, useRef, useState } from 'react';
import './Header.css';

export default function Header({ usuario, onLogout }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function aoClicarFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const iniciais = usuario?.nome
    ?.trim()
    ?.split(/\s+/)
    ?.slice(0, 2)
    ?.map(parte => parte[0]?.toUpperCase())
    ?.join('') || '?';

  return (
    <header className="app-header">
      <span className="app-header-titulo">Bem-vindo, {usuario?.nome}</span>
      <div className="app-header-usuario" ref={menuRef}>
        <button
          className="app-header-usuario-botao"
          onClick={() => setMenuAberto(v => !v)}
        >
          <span className="app-header-avatar">{iniciais}</span>
          <span className="app-header-nome">{usuario?.nome}</span>
        </button>
        {menuAberto && (
          <div className="app-header-menu">
            <button className="app-header-sair" onClick={onLogout}>Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
