'use client'
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export default function PainelAdm() {
  const [view, setView] = useState('login');
  const [aba, setAba] = useState('Agendamento geral');
  const [agendamentos, setAgendamentos] = useState([]);

  // --- LOGIN & RECUPERAÇÃO ---
  const handleLogin = (e) => {
    e.preventDefault();
    if(e.target.user.value === 'nilo pet' && e.target.pass.value === 'nilopet2026') setView('painel');
    else alert("Dados incorretos!");
  };

  // --- EXPORTAR EXCEL ---
  const exportarRelatorio = () => {
    const ws = XLSX.utils.json_to_sheet(agendamentos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio Nilo Pet");
    XLSX.writeFile(wb, `Relatorio_NiloPet.xlsx`);
  };

  if(view === 'login') return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border-t-8 border-blue-600">
        <h1 className="text-2xl font-black text-blue-900 text-center mb-6">NILO PET ADM</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="user" placeholder="Login" className="w-full p-4 bg-blue-50 rounded-xl outline-none" required />
          <input name="pass" type="password" placeholder="Senha" className="w-full p-4 bg-blue-50 rounded-xl outline-none" required />
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">ENTRAR</button>
        </form>
        <button onClick={() => {let p = prompt("Qual o nome do pet?"); if(p?.toLowerCase()==='nilo') alert("Sua senha é: nilopet2026")}} className="w-full mt-4 text-xs text-blue-400">Esqueci senha</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 flex">
      {/* SIDEBAR ESQUERDA */}
      <aside className="w-72 bg-blue-700 text-white p-6 flex flex-col gap-2 shadow-2xl">
        <h2 className="text-xl font-black mb-8 border-b border-blue-500 pb-4">NILO PET ADM</h2>
        {['Agendamento geral', 'Agendamento do dia', 'Pacotes', 'Gestão de vagas', 'Bloqueios', 'Exportar relatório'].map(item => (
          <button key={item} onClick={() => setAba(item)} className={`text-left p-3 rounded-xl transition ${aba === item ? 'bg-white text-blue-700 shadow-md' : 'hover:bg-blue-600'}`}>{item}</button>
        ))}
        <button onClick={() => window.location.reload()} className="mt-auto bg-red-400 p-3 rounded-xl font-bold">Sair</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 uppercase">{aba}</h1>
          {aba === 'Exportar relatório' && <button onClick={exportarRelatorio} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold">EXPORTAR PARA EXCEL</button>}
        </div>

        {/* LISTAGEM (Exemplo) */}
        <div className="grid gap-4">
          {agendamentos.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-400 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{item.nome_cliente} - {item.nome_pet}</p>
                <p className="text-sm text-gray-500">{item.data_agendamento} às {item.horario} | {item.tipo_pacote}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-500 text-xs font-bold">Alterar</button>
                <button className="text-red-500 text-xs font-bold">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
