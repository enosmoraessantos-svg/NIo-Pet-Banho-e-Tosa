import React, { useState, useEffect } from 'react';
import { supabaseClient } from './lib/supabase';
import * as XLSX from 'xlsx';

export default function PainelAdm() {
  const [logado, setLogado] = useState(false);
  const [aba, setAba] = useState('Geral');
  const [dados, setDados] = useState([]);

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if(e.target.login.value === 'nilo pet' && e.target.senha.value === 'nilopet2026') setLogado(true);
    else alert("Dados incorretos");
  };

  // --- EXPORTAR EXCEL ---
  const exportar = () => {
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, "NiloPet_Relatorio.xlsx");
  };

  if(!logado) return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center font-sans">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-80 border-t-4 border-blue-600">
        <h1 className="text-xl font-bold text-blue-800 mb-6 text-center">NILO PET ADM</h1>
        <input name="login" placeholder="Login" className="w-full mb-3 p-3 border rounded-lg outline-none" required />
        <input name="senha" type="password" placeholder="Senha" className="w-full mb-6 p-3 border rounded-lg outline-none" required />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">ENTRAR</button>
        <p onClick={() => {let p = prompt("Qual o nome do pet?"); if(p==='nilo') alert("Senha: nilopet2026")}} className="text-center text-xs text-blue-400 mt-4 cursor-pointer">Esqueci senha</p>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-blue-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-600 text-white p-6 shadow-2xl">
        <h2 className="text-xl font-black mb-8">NILO PET</h2>
        <div className="flex flex-col gap-2">
          {['Geral', 'Do Dia', 'Pacotes', 'Vagas', 'Bloqueios', 'Relatório'].map(t => (
            <button key={t} onClick={() => setAba(t)} className={`text-left p-3 rounded-lg ${aba === t ? 'bg-blue-800' : 'hover:bg-blue-500'}`}>{t}</button>
          ))}
          <button onClick={() => setLogado(false)} className="mt-10 bg-red-400 p-2 rounded text-sm">Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 uppercase">Agendamento {aba}</h1>
          {aba === 'Relatório' && <button onClick={exportar} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow">EXPORTAR EXCEL</button>}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[400px]">
           {/* Aqui entram as listas de agendamentos filtradas por aba */}
           <p className="text-gray-400 italic">Carregando dados definitivos do Supabase...</p>
        </div>
      </main>
    </div>
  );
}
