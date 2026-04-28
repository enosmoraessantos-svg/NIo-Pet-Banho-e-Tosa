'use client'
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export default function PainelAdm() {
  const [view, setView] = useState('login');
  const [aba, setAba] = useState('Agendamento geral');
  const [agendamentos, setAgendamentos] = useState([]);

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = e.target.user.value;
    const pass = e.target.pass.value;
    if(user === 'nilo pet' && pass === 'nilopet2026') setView('painel');
    else alert("Dados incorretos!");
  };

  // --- CARREGAR DADOS ---
  useEffect(() => {
    if (view === 'painel') {
      const fetchDados = async () => {
        const { data } = await supabaseClient.from('agendamentos').select('*').order('data_agendamento', { ascending: true });
        setAgendamentos(data || []);
      };
      fetchDados();
    }
  }, [view]);

  if(view === 'login') return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border-t-8 border-blue-600">
        <h1 className="text-2xl font-black text-blue-900 text-center mb-6 uppercase">Nilo Pet ADM</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="user" placeholder="Login" className="w-full p-4 bg-blue-100 rounded-xl outline-none" required />
          <input name="pass" type="password" placeholder="Senha" className="w-full p-4 bg-blue-100 rounded-xl outline-none" required />
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700">ENTRAR</button>
        </form>
        <button onClick={() => {let p = prompt("Qual o nome do pet?"); if(p?.toLowerCase()==='nilo') alert("Senha: nilopet2026")}} className="w-full mt-4 text-xs text-blue-400">Esqueci senha</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-100 flex">
      <aside className="w-72 bg-blue-700 text-white p-6 flex flex-col gap-2 shadow-2xl">
        <h2 className="text-xl font-black mb-8 border-b border-blue-500 pb-4">NILO PET ADM</h2>
        {['Agendamento geral', 'Agendamento do dia', 'Pacotes', 'Gestão de vagas', 'Bloqueios', 'Exportar relatório'].map(item => (
          <button key={item} onClick={() => setAba(item)} className={`text-left p-3 rounded-xl transition ${aba === item ? 'bg-white text-blue-700 shadow-md' : 'hover:bg-blue-600'}`}>{item}</button>
        ))}
        <button onClick={() => window.location.reload()} className="mt-auto bg-red-400 p-3 rounded-xl font-bold">Sair</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-blue-900 uppercase mb-8">{aba}</h1>
        <div className="grid gap-4">
          {agendamentos.length === 0 ? <p className="text-blue-400 italic">Nenhum agendamento encontrado.</p> : 
            agendamentos.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-400 flex justify-between items-center">
                <div>
                  <p className="font-bold text-blue-900">{item.nome_cliente} - {item.nome_pet}</p>
                  <p className="text-xs text-gray-500 uppercase">{item.tipo_pacote} | {item.data_agendamento} às {item.horario}</p>
                </div>
                <button className="text-red-500 font-bold text-xs">Excluir</button>
              </div>
            ))
          }
        </div>
      </main>
    </div>
  );
}

