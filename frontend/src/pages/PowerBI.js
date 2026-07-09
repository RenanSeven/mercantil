import React from 'react';
import './PowerBI.css';

export default function PowerBI() {
  return (
    <div className="powerbi-pagina">
      <h1>Power BI</h1>
      <div className="powerbi-card card">
        <div className="powerbi-card-icone">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="10" width="5" height="11" rx="1" fill="#F2C811" />
            <rect x="9.5" y="6" width="5" height="15" rx="1" fill="#D9A400" />
            <rect x="17" y="2" width="5" height="19" rx="1" fill="#F2C811" />
          </svg>
        </div>
        <div className="powerbi-card-texto">
          <h2>Relatório Mercantil</h2>
          <p>Baixe o arquivo do Power BI com o relatório completo.</p>
        </div>
        <a className="powerbi-card-botao" href="/arquivos/Mercantil.pbix" download>
          Baixar .pbix
        </a>
      </div>
    </div>
  );
}
