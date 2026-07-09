import React, { useState, useRef, useEffect } from 'react';
import './ChatRelatorio.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:3333';

export default function ChatRelatorio({ resumo }) {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, aberto]);

  async function enviar(e) {
    e.preventDefault();
    const texto = pergunta.trim();
    if (!texto || carregando) return;

    const historico = mensagens.map(m => ({ role: m.role, content: m.content }));
    const novasMensagens = [...mensagens, { role: 'user', content: texto }];
    setMensagens(novasMensagens);
    setPergunta('');
    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: texto, resumo, historico }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Erro ao consultar a IA.');
      setMensagens(msgs => [...msgs, { role: 'assistant', content: dados.resposta }]);
    } catch (err) {
      setMensagens(msgs => [...msgs, { role: 'assistant', content: `⚠️ ${err.message}` }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="chat-relatorio">
      {aberto && (
        <div className="chat-relatorio-janela card">
          <div className="chat-relatorio-cabecalho">
            <span>Pergunte sobre o relatório</span>
            <button onClick={() => setAberto(false)}>✕</button>
          </div>
          <div className="chat-relatorio-mensagens">
            {mensagens.length === 0 && (
              <p className="chat-relatorio-vazio">
                Pergunte algo sobre os dados de vendas exibidos no dashboard, ex: "qual vendedor vendeu mais?"
              </p>
            )}
            {mensagens.map((m, i) => (
              <div key={i} className={`chat-relatorio-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {carregando && <div className="chat-relatorio-msg assistant">Digitando...</div>}
            <div ref={fimRef} />
          </div>
          <form className="chat-relatorio-form" onSubmit={enviar}>
            <input
              type="text"
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={carregando}
            />
            <button type="submit" disabled={carregando || !pergunta.trim()}>Enviar</button>
          </form>
        </div>
      )}
      <button className="chat-relatorio-fab" onClick={() => setAberto(v => !v)} title="Chat sobre o relatório">
        {aberto ? '✕' : '💬'}
      </button>
    </div>
  );
}
