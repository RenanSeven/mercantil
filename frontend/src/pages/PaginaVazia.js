import React from 'react';
import './PaginaVazia.css';

export default function PaginaVazia({ titulo }) {
  return (
    <div className="pagina-vazia">
      <h1>{titulo}</h1>
      <div className="pagina-vazia-card card">
        <p>Nenhum conteúdo disponível ainda.</p>
      </div>
    </div>
  );
}
