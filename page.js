import React, { useState, useEffect } from 'react';

const NiloPetAgendamento = () => {
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    endereco: '',
    qtdPets: 1,
    pets: [{ nome: '', especie: 'Cachorro', porte: 'Pequeno', alergia: 'Não', obs: '' }],
    tipoServico: 'Avulso',
    servicoEscolhido: '',
    data: '',
    horario: ''
  });

  // Estilo Base
  const styleBase = "bg-[#e0f2fe] border-2 border-black text-[#ff0000] p-6 rounded-none font-bold";
  const inputStyle = "w-full border-2 border-black p-2 bg-white text-black mt-2 mb-4";
  const btnStyle = "bg-white border-2 border-black text-[#ff0000] px-4 py-2 hover:bg-red-100 transition-all font-black";

  // Lógica de Datas (Regra do dia 20)
  const renderCalendario = () => {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const mesAtual = hoje.getMonth();
    const podeVerProximoMes = diaAtual >= 20;
    
    // Aqui você integraria um componente de calendário que bloqueia seg/ter
    return (
      <div className="mt-4">
        <p className="mb-2">Escolha uma data (Qua a Dom):</p>
        <input type="date" className={inputStyle} onChange={(e) => setFormData({...formData, data: e.target.value})} />
        {podeVerProximoMes ? <p className="text-xs">* Próximo mês liberado!</p> : <p className="text-xs">* Próximo mês libera dia 20</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 flex justify-center items-start">
      <div className={`${styleBase} w-full max-w-lg`}>
        <h1 className="text-2xl text-center mb-6 border-b-2 border-black pb-2">NILO PET BANHO E TOSA</h1>

        {/* ETAPA 1: IDENTIFICAÇÃO */}
        {etapa === 1 && (
          <div>
            <h2 className="mb-4 underline text-xl text-black">Etapa 1: Seus Dados</h2>
            <label>NOME COMPLETO *</label>
            <input className={inputStyle} value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            
            <label>WHATSAPP (11 DÍGITOS) *</label>
            <input className={inputStyle} placeholder="11999999999" maxLength={11} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
            
            <label>ENDEREÇO (SÓ ATENDEMOS SOL NASCENTE) *</label>
            <textarea className={inputStyle} value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
            
            <button className={btnStyle} onClick={() => setEtapa(2)}>PRÓXIMO: DADOS DO PET</button>
          </div>
        )}

        {/* ETAPA 2: PETS */}
        {etapa === 2 && (
          <div>
            <h2 className="mb-4 underline text-xl text-black">Etapa 2: Sobre os Pets</h2>
            <label>QUANTOS PETS? (MÁX 4)</label>
            <select className={inputStyle} onChange={(e) => {
              const qtd = parseInt(e.target.value);
              const novosPets = Array.from({length: qtd}, () => ({ nome: '', especie: 'Cachorro', porte: 'Pequeno', alergia: 'Não', obs: '' }));
              setFormData({...formData, qtdPets: qtd, pets: novosPets});
            }}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            {formData.pets.map((pet, i) => (
              <div key={i} className="border border-black p-3 mb-4 bg-blue-100">
                <p className="text-black mb-2 font-black italic">PET #{i+1}</p>
                <input className={inputStyle} placeholder="Nome do Pet" onChange={(e) => {
                   let p = [...formData.pets]; p[i].nome = e.target.value; setFormData({...formData, pets: p});
                }} />
                <select className={inputStyle} onChange={(e) => {
                   let p = [...formData.pets]; p[i].especie = e.target.value; setFormData({...formData, pets: p});
                }}>
                  <option>Cachorro</option>
                  <option>Gato</option>
                </select>
                <select className={inputStyle} onChange={(e) => {
                   let p = [...formData.pets]; p[i].porte = e.target.value; setFormData({...formData, pets: p});
                }}>
                  <option>Pequeno</option>
                  <option>Médio</option>
                  <option>Grande pelo curto</option>
                  <option>Grande peludo</option>
                </select>
              </div>
            ))}
            <div className="flex justify-between">
                <button className="text-black underline" onClick={() => setEtapa(1)}>Voltar</button>
                <button className={btnStyle} onClick={() => setEtapa(3)}>PRÓXIMO: SERVIÇOS</button>
            </div>
          </div>
        )}

        {/* ETAPA 3: SERVIÇOS/PACOTES */}
        {etapa === 3 && (
          <div>
            <h2 className="mb-4 underline text-xl text-black">Etapa 3: Plano</h2>
            <div className="flex gap-4 mb-4">
                <button className={`${btnStyle} ${formData.tipoServico === 'Avulso' ? 'bg-black text-white' : ''}`} onClick={() => setFormData({...formData, tipoServico: 'Avulso'})}>AVULSO</button>
                <button className={`${btnStyle} ${formData.tipoServico === 'Pacote' ? 'bg-black text-white' : ''}`} onClick={() => setFormData({...formData, tipoServico: 'Pacote'})}>PACOTES</button>
            </div>

            {formData.tipoServico === 'Avulso' ? (
              <select className={inputStyle} onChange={(e) => setFormData({...formData, servicoEscolhido: e.target.value})}>
                <option>Selecione...</option>
                <option>Banho</option>
                <option>Banho + Tosa Higiênica</option>
                <option>Banho + Tosa</option>
              </select>
            ) : (
              <select className={inputStyle} onChange={(e) => setFormData({...formData, servicoEscolhido: e.target.value})}>
                <option>Selecione o Pacote...</option>
                <option>Básico (1 Banho + 1 Banho/Tosa Higiênica)</option>
                <option>Básico com Tosa (1 Banho + 1 Banho/Tosa)</option>
                <option>Premium (3 Banhos + 1 Banho/Tosa Higiênica)</option>
              </select>
            )}
            <button className={btnStyle} onClick={() => setEtapa(4)}>PRÓXIMO: FINALIZAR</button>
          </div>
        )}

        {/* ETAPA 4: DATA/HORA E CONFIRMAÇÃO */}
        {etapa === 4 && (
          <div className="text-center">
            <h2 className="mb-4 underline text-xl text-black">Etapa 4: Agendar</h2>
            {renderCalendario()}
            
            <p className="mt-4">Horários Disponíveis para esta regra:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Aqui a lógica de slots filtraria os botões abaixo */}
                <button className="border border-black p-2 hover:bg-black hover:text-white" onClick={() => setFormData({...formData, horario: '09:00'})}>09:00</button>
                <button className="border border-black p-2 hover:bg-black hover:text-white" onClick={() => setFormData({...formData, horario: '10:00'})}>10:00</button>
                <button className="border border-black p-2 hover:bg-black hover:text-white" onClick={() => setFormData({...formData, horario: '11:00'})}>11:00</button>
            </div>

            <button className={`${btnStyle} w-full mt-8 bg-red-600 text-white`} onClick={() => setEtapa(5)}>CONFIRMAR AGENDAMENTO</button>
          </div>
        )}

        {/* TELA FINAL */}
        {etapa === 5 && (
          <div className="text-center animate-bounce">
            <h2 className="text-2xl mb-4">✅ AGENDAMENTO CONFIRMADO!</h2>
            <p className="text-xl">LOGO MAIS NOSSA EQUIPE ENTRARÁ EM CONTATO PARA PASSAR VALORES.</p>
            <p className="mt-4 text-black border-2 border-black p-2">DE IMEDIATO ENVIE UMA FOTO DO PET PARA ACELERAR O PROCESSO.</p>
            <button className="mt-6 underline text-black">Gerenciar minhas sessões (Cancelar/Reagendar)</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NiloPetAgendamento;
