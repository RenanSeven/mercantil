import React, { useEffect, useState } from 'react';
import './ListaNomes.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:3333';

export default function ListaNomes() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarLista() {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/lista`);
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Erro ao carregar lista.');
      setItens(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLista();
  }, []);

  async function aoSubmeter(e) {
    e.preventDefault();
    if (!nome.trim() || !idade) return;
    setSalvando(true);
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), idade: Number(idade) }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Erro ao salvar.');
      setNome('');
      setIdade('');
      await carregarLista();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    try {
      await fetch(`${API_URL}/api/lista/${id}`, { method: 'DELETE' });
      setItens(itens.filter(i => i.id !== id));
    } catch (err) {
      setErro('Erro ao remover item.');
    }
  }

  return (
    <div className="lista-nomes-pagina">
      <h1>Lista de Nomes</h1>

      <form className="lista-nomes-form card" onSubmit={aoSubmeter}>
        <div className="lista-nomes-campo">
          <label>Nome</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Ana" />
        </div>
        <div className="lista-nomes-campo">
          <label>Idade</label>
          <input type="number" min="0" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 28" />
        </div>
        <button type="submit" disabled={salvando || !nome.trim() || !idade}>
          {salvando ? 'Salvando...' : 'Adicionar'}
        </button>
      </form>

      {erro && <p className="lista-nomes-erro">⚠️ {erro}</p>}

      <div className="lista-nomes-card card">
        {carregando ? (
          <p className="lista-nomes-vazio">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="lista-nomes-vazio">Nenhum nome cadastrado ainda.</p>
        ) : (
          <table className="lista-nomes-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.idade} anos</td>
                  <td>
                    <button className="lista-nomes-remover" onClick={() => remover(item.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
