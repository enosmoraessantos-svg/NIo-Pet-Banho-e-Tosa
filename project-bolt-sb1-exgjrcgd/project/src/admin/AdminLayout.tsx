import { useState } from 'react';
import {
  CalendarDays, Calendar, Package, Settings, Lock, Download, LogOut, PawPrint, Menu, X
} from 'lucide-react';

export type AdminTab = 'agendamento_geral' | 'agendamento_dia' | 'pacotes' | 'gestao_vagas' | 'bloqueios' | 'exportar';

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
  { tab: 'agendamento_geral', label: 'Agendamento Geral', icon: <CalendarDays className="w-5 h-5" /> },
  { tab: 'agendamento_dia', label: 'Agendamento do Dia', icon: <Calendar className="w-5 h-5" /> },
  { tab: 'pacotes', label: 'Pacotes', icon: <Package className="w-5 h-5" /> },
  { tab: 'gestao_vagas', label: 'Gestão de Vagas', icon: <Settings className="w-5 h-5" /> },
  { tab: 'bloqueios', label: 'Bloqueio / Desbloqueio', icon: <Lock className="w-5 h-5" /> },
  { tab: 'exportar', label: 'Exportar Relatório', icon: <Download className="w-5 h-5" /> },
];

export default function AdminLayout({ activeTab, onTabChange, onLogout, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">Nilo Pet</p>
            <p className="text-xs text-gray-500">Banho e Tosa</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.tab}
              onClick={() => { onTabChange(item.tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === item.tab
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={activeTab === item.tab ? 'text-amber-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-semibold text-gray-800 text-sm md:text-base">
            {navItems.find(n => n.tab === activeTab)?.label}
          </h2>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
