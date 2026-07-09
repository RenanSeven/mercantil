import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const API_URL = process.env.REACT_APP_AUTH_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3333');

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const resp = await fetch(`${API_URL}/api/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || 'Não foi possível cadastrar.');
        return;
      }
      setSucesso(true);
      setTimeout(() => navigate('/login'), 1200);
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
        <h1>Criar conta</h1>
        {erro && <div className="auth-erro">{erro}</div>}
        {sucesso && <div className="auth-sucesso">Conta criada! Redirecionando para o login...</div>}
        <label>
          Nome
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6} />
        </label>
        <button type="submit" className="auth-botao" disabled={carregando}>
          {carregando ? 'Criando...' : 'Criar conta'}
        </button>
        <p className="auth-rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
