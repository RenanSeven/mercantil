import React, { useEffect } from 'react';
import './ModalStorytelling.css';

const REGEX_DESTAQUE = /\[\[([+-])(.*?)\]\]/g;

function renderizarTexto(texto) {
  const partes = [];
  let ultimoIndice = 0;
  let match;
  let chave = 0;

  while ((match = REGEX_DESTAQUE.exec(texto)) !== null) {
    if (match.index > ultimoIndice) {
      partes.push(texto.slice(ultimoIndice, match.index));
    }
    const sinal = match[1];
    const conteudo = match[2];
    partes.push(
      <strong key={chave++} className={sinal === '+' ? 'modal-story-positivo' : 'modal-story-negativo'}>
        {conteudo}
      </strong>
    );
    ultimoIndice = match.index + match[0].length;
  }
  if (ultimoIndice < texto.length) {
    partes.push(texto.slice(ultimoIndice));
  }
  return partes;
}

export default function ModalStorytelling({ aberto, onFechar, carregando, texto, erro, subtitulo }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="modal-story-fundo" onClick={onFechar}>
      <div className="modal-story-caixa card" onClick={e => e.stopPropagation()}>
        <div className="modal-story-cabecalho">
          <div>
            <h2>📖 Storytelling</h2>
            {subtitulo && <span className="modal-story-subtitulo">{subtitulo}</span>}
          </div>
          <button className="modal-story-fechar" onClick={onFechar}>✕</button>
        </div>
        <div className="modal-story-corpo">
          {carregando && <p className="modal-story-carregando">Gerando análise...</p>}
          {!carregando && erro && <p className="modal-story-erro">⚠️ {erro}</p>}
          {!carregando && !erro && texto && (
            <p className="modal-story-texto">{renderizarTexto(texto)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
