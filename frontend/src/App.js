import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import DashboardVendas from './pages/DashboardVendas';
import DashboardDespesas from './pages/DashboardDespesas';
import PowerBI from './pages/PowerBI';
import Sistemas from './pages/Sistemas';
import ListaNomes from './pages/ListaNomes';
import Contador from './pages/Contador';
import Acessos from './pages/Acessos';
import CaseTecnico from './pages/CaseTecnico';

function Layout({ usuario, onLogout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header usuario={usuario} onLogout={onLogout} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/vendas" element={<DashboardVendas />} />
            <Route path="/dashboard/despesas" element={<DashboardDespesas />} />
            <Route path="/sistemas" element={<Sistemas />} />
            <Route path="/sistemas/lista-nomes" element={<ListaNomes />} />
            <Route path="/sistemas/contador" element={<Contador />} />
            <Route path="/power-bi" element={<PowerBI />} />
            <Route path="/case-tecnico" element={<CaseTecnico />} />
            <Route path="/acessos" element={<Acessos />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Login onLogin={setUser} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout usuario={user} onLogout={() => setUser(null)} />
    </BrowserRouter>
  );
}
