import React, { useEffect, useState } from 'react';
import './Acessos.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3333');

export default function Acessos() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const res = await fetch(`${API_URL}/api/usuarios`);
        const dados = await res.json();
        if (!res.ok) throw new Error(dados.erro || 'Erro ao carregar usuários.');
        setUsuarios(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const formatoData = data => new Date(data).toLocaleDateString('pt-BR');

  return (
    <div className="acessos-pagina">
      <h1>Acessos</h1>

      {erro && <p className="acessos-erro">⚠️ {erro}</p>}

      <div className="acessos-card card">
        {carregando ? (
          <p className="acessos-vazio">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p className="acessos-vazio">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <table className="acessos-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cadastrado em</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{formatoData(u.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
