import React, { useRef, useState } from 'react';
import './Contador.css';

function contarLinhas(texto) {
  const linhas = texto.split(/\r\n|\r|\n/);
  if (linhas.length > 1 && linhas[linhas.length - 1] === '') {
    linhas.pop();
  }
  return linhas.length;
}

export default function Contador() {
  const [arrastando, setArrastando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [qtdeLinhas, setQtdeLinhas] = useState(0);
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);

  function processarArquivo(arquivo) {
    if (!arquivo) return;
    setErro('');

    if (!arquivo.name.toLowerCase().endsWith('.txt')) {
      setErro('Envie um arquivo .txt.');
      return;
    }

    const leitor = new FileReader();
    leitor.onload = e => {
      const texto = e.target.result;
      setNomeArquivo(arquivo.name);
      setQtdeLinhas(contarLinhas(texto));
      setModalAberto(true);
    };
    leitor.onerror = () => setErro('Erro ao ler o arquivo.');
    leitor.readAsText(arquivo);
  }

  function aoSoltar(e) {
    e.preventDefault();
    setArrastando(false);
    processarArquivo(e.dataTransfer.files[0]);
  }

  function aoSelecionar(e) {
    processarArquivo(e.target.files[0]);
    e.target.value = '';
  }

  return (
    <div className="contador-pagina">
      <h1>Contador</h1>

      <div
        className={'contador-dropzone' + (arrastando ? ' arrastando' : '')}
        onDragOver={e => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
      >
        <div className="contador-dropzone-icone">📄</div>
        <p className="contador-dropzone-texto">Arraste um arquivo .txt aqui</p>
        <p className="contador-dropzone-subtexto">ou</p>
        <button className="contador-botao" onClick={() => inputRef.current.click()}>
          Selecionar arquivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={aoSelecionar}
        />
      </div>

      {erro && <p className="contador-erro">⚠️ {erro}</p>}

      {modalAberto && (
        <div className="contador-modal-fundo" onClick={() => setModalAberto(false)}>
          <div className="contador-modal-caixa card" onClick={e => e.stopPropagation()}>
            <button className="contador-modal-fechar" onClick={() => setModalAberto(false)}>✕</button>
            <div className="contador-modal-icone">📄</div>
            <h2>{nomeArquivo}</h2>
            <p className="contador-modal-qtde">{qtdeLinhas}</p>
            <p className="contador-modal-label">{qtdeLinhas === 1 ? 'linha' : 'linhas'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
