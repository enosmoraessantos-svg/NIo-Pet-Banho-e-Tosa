import { useState } from 'react';
import AdminLayout, { AdminTab } from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AgendamentoGeral from './admin/AgendamentoGeral';
import AgendamentoDia from './admin/AgendamentoDia';
import Pacotes from './admin/Pacotes';
import GestaoVagas from './admin/GestaoVagas';
import Bloqueios from './admin/Bloqueios';
import ExportarRelatorio from './admin/ExportarRelatorio';
import BookingFlow from './client/BookingFlow';

function isAdminPath(): boolean {
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  return (
    path.startsWith('/admin') ||
    new URLSearchParams(search).get('admin') === 'true' ||
    hash.includes('admin=true')
  );
}

export default function App() {
  const [isAdmin] = useState(isAdminPath);
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('nilo_admin') === 'true');
  const [activeTab, setActiveTab] = useState<AdminTab>('agendamento_geral');

  if (!isAdmin) {
    return <BookingFlow />;
  }

  if (!loggedIn) {
    return (
      <AdminLogin
        onLogin={() => {
          sessionStorage.setItem('nilo_admin', 'true');
          setLoggedIn(true);
        }}
      />
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('nilo_admin');
    setLoggedIn(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'agendamento_geral': return <AgendamentoGeral />;
      case 'agendamento_dia': return <AgendamentoDia />;
      case 'pacotes': return <Pacotes />;
      case 'gestao_vagas': return <GestaoVagas />;
      case 'bloqueios': return <Bloqueios />;
      case 'exportar': return <ExportarRelatorio />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {renderTab()}
    </AdminLayout>
  );
}
