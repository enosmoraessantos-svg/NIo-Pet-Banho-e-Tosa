import React, { useState } from 'react';
import { supabaseClient } from './lib/supabase';

export default function LinkCliente() {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    nome_cliente: '', qtd_pets: 1, tipo_pacote: 'avulso', especie: 'Cachorro',
    nome_pet: '', porte: '', alergia: '', whatsapp: '', endereco: 'Bairro Sol Nascente',
    data: '', horario: ''
  });

  const enviar = async () => {
    const { error } = await supabaseClient.from('agendamentos').insert([form]);
    if(!error) setEtapa(5);
    else alert("Erro ao salvar. Verifique os campos.");
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-b-8 border-blue-600">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold">Nilo Pet Banho e Tosa</h1>
          <p className="text-xs opacity-80">Agendamento Online - Passo {etapa} de 4</p>
        </div>

        <div className="p-8">
          {etapa === 1 && (
            <div className="space-y-4">
              <input placeholder="Seu Nome" className="w-full p-4 bg-blue-50 rounded-xl outline-none border border-blue-100" onChange={e => setForm({...form, nome_cliente: e.target.value})} required />
              <select className="w-full p-4 bg-blue-50 rounded-xl outline-none border border-blue-100" onChange={e => setForm({...form, tipo_pacote: e.target.value})}>
                <option value="avulso">Avulso</option>
                <option value="basico">Básico</option>
                <option value="basico+tosa">Básico + Tosa</option>
                <option value="premium">Premium</option>
              </select>
              <button onClick={() => setEtapa(2)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg">PRÓXIMO</button>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-4">
              <input placeholder="Nome do Pet" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, nome_pet: e.target.value})} required />
              <input placeholder="Porte (Ex: Pequeno)" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, porte: e.target.value})} required />
              <input placeholder="Whatsapp" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, whatsapp: e.target.value})} required />
              <input value="Bairro Sol Nascente" className="w-full p-4 bg-gray-100 rounded-xl text-gray-500" disabled />
              <button onClick={() => setEtapa(3)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">CONTINUAR</button>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-4">
              <p className="text-center text-sm font-bold text-blue-800">Escolha a Data e Horário:</p>
              <input type="date" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, data: e.target.value})} required />
              <input type="time" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, horario: e.target.value})} required />
              <button onClick={() => setEtapa(4)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">REVISAR DADOS</button>
            </div>
          )}

          {etapa === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-2xl text-sm border-2 border-dashed border-blue-200">
                <p><strong>Cliente:</strong> {form.nome_cliente}</p>
                <p><strong>Pet:</strong> {form.nome_pet} ({form.tipo_pacote})</p>
                <p><strong>Data:</strong> {form.data} às {form.horario}</p>
              </div>
              <button onClick={enviar} className="w-full bg-green-500 text-white p-5 rounded-xl font-black text-xl shadow-xl animate-bounce">OK! AGENDAR AGORA</button>
            </div>
          )}

          {etapa === 5 && (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-green-600 mb-4">AGENDADO!</h2>
              <p className="text-gray-600 text-sm">Em breve nossa equipe vai entrar em contato. De imediato mande foto do seu pet para adiantar o seu atendimento.</p>
              <button onClick={() => window.location.reload()} className="mt-8 text-blue-600 font-bold">Fazer outro agendamento</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
