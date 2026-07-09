import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3333');

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const resp = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || 'Não foi possível entrar.');
        return;
      }
      onLogin(dados);
    } catch (err) {
      setErro('Não foi possível conectar ao servidor de autenticação.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-tela">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <img src="/imagens/logo-mercantil-azul.png" alt="Mercantil" className="auth-logo-imagem" />
        </div>
        <h1>Entrar</h1>
        {erro && <div className="auth-erro">{erro}</div>}
        <label>
          E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </label>
        <button type="submit" className="auth-botao" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="auth-rodape">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
