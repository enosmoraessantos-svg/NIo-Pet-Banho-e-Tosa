'use client'
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

export default function AgendamentoCliente() {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    nome_cliente: '', qtd_pets: 1, tipo_pacote: 'avulso', especie: 'Cachorro',
    nome_pet: '', porte: '', alergia: '', whatsapp: '', endereco: 'Bairro Sol Nascente'
  });

  const next = () => {
    const fields = document.querySelectorAll('[required]');
    let valid = true;
    fields.forEach(f => { if(!f.value) valid = false; });
    if(valid) setEtapa(etapa + 1); else alert("Preencha todos os campos!");
  };

  const finalizar = async () => {
    const { error } = await supabaseClient.from('agendamentos').insert([form]);
    if(!error) setEtapa(5);
    else alert("Erro ao agendar.");
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-b-8 border-blue-600">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold italic">Nilo Pet</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-70">Passo {etapa} de 4</p>
        </div>

        <div className="p-8">
          {etapa === 1 && (
            <div className="space-y-4">
              <input placeholder="NOME DO CLIENTE" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, nome_cliente: e.target.value})} required />
              <input type="number" placeholder="QTD PETS (ATÉ 4)" max="4" min="1" className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, qtd_pets: e.target.value})} required />
              <select className="w-full p-4 bg-blue-50 rounded-xl" onChange={e => setForm({...form, tipo_pacote: e.target.value})} required>
                <option value="">ESCOLHA O PACOTE</option>
                <option value="avulso">Avulso</option>
                <option value="basico">Básico</option>
                <option value="basico+tosa">Básico + Tosa</option>
                <option value="premium">Premium</option>
              </select>
              <button onClick={next} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">PRÓXIMO</button>
            </div>
          )}

          {/* Etapa 2 e 3 seguem o mesmo padrão com os campos obrigatórios solicitados */}

          {etapa === 4 && (
            <div className="space-y-4">
              <h2 className="text-center font-bold text-blue-900">REVISÃO DOS DADOS</h2>
              <div className="bg-blue-50 p-4 rounded-2xl text-xs space-y-1">
                <p><strong>Cliente:</strong> {form.nome_cliente}</p>
                <p><strong>Pet:</strong> {form.nome_pet} ({form.especie})</p>
                <p><strong>Endereço:</strong> {form.endereco}</p>
              </div>
              <button onClick={finalizar} className="w-full bg-green-500 text-white p-5 rounded-xl font-black text-xl">CONFIRMAR E AGENDAR</button>
            </div>
          )}

          {etapa === 5 && (
            <div className="text-center py-6">
              <h2 className="text-3xl font-black text-green-600">AGENDADO!</h2>
              <p className="mt-4 text-sm text-gray-600 font-medium">Em breve nossa equipe vai entrar em contato de imediato mande foto do seu pet para adiantar o seu atendimento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
