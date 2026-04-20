/**
 * REGRAS ADICIONAIS - NILO PET ADM (VERSÃO UNIFICADA)
 */

(function() {
    // --- 1. RECUPERAÇÃO DE SENHA ---
    const CONFIG_RECUPERACAO = {
        pergunta: "Qual o nome da primeira mascote da Nilo Pet?",
        respostaCorreta: "nilo",
        senhaOriginal: "nilopet2024"
    };

    function injetarBotao() {
        const btnEntrar = document.querySelector('#loginArea button');
        if (btnEntrar && !document.getElementById('btnEsqueciInjetado')) {
            const btnEsqueci = document.createElement('button');
            btnEsqueci.id = "btnEsqueciInjetado";
            btnEsqueci.innerText = "ESQUECI A SENHA";
            btnEsqueci.style = "font-size: 10px; color: #94a3b8; font-weight: 800; margin-top: 15px; cursor: pointer; text-transform: uppercase; display: block; width: 100%;";
            btnEntrar.parentNode.appendChild(btnEsqueci);

            btnEsqueci.onclick = (e) => {
                e.preventDefault();
                const respostaUser = prompt(CONFIG_RECUPERACAO.pergunta);
                if (respostaUser?.toLowerCase().trim() === CONFIG_RECUPERACAO.respostaCorreta) {
                    alert("✅ VALIDAÇÃO COM SUCESSO!\nSua senha é: " + CONFIG_RECUPERACAO.senhaOriginal);
                } else if (respostaUser !== null) {
                    alert("❌ RESPOSTA INCORRETA!");
                }
            };
        }
    }

    window.addEventListener('load', injetarBotao);
    setTimeout(injetarBotao, 1000);

window.renderVagas = function(container) {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let html = `<div class="card-pet">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
            <div class="flex gap-2">
                <button onclick="alert('✅ Configurações salvas!')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">Salvar Alterações 💾</button>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
        </div>`;

    for (let i = 0; i <= 6; i++) {
        const itens = todosDados.filter(v => v.dia_semana == i);
        html += `<div class="mb-8 border-l-4 ${itens.length ? 'border-red-600' : 'border-slate-200'} pl-4">
            <h4 class="font-black ${itens.length ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">${dias[i]}</h4>`;
        
        itens.forEach(v => {
            html += `<div class="bg-white p-4 rounded-xl border mb-4 shadow-sm text-black border-slate-300">
                <div class="flex justify-between border-b border-dashed pb-2 mb-4">
                    <span class="font-black text-xl text-slate-800">${v.horario}</span>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-1">
                            <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)" class="w-4 h-4">
                            <label class="text-[10px] font-black uppercase text-red-600">Bloquear Horário</label>
                        </div>
                        <button onclick="removerHorario(${v.id})" class="text-slate-300 hover:text-red-600 transition">✕</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- COLUNA 1: PEQUENOS E MÉDIOS (CACHORRO) -->
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p class="text-[10px] font-black uppercase text-slate-500 mb-3 border-b pb-1">🐶 Cães Pequeno / Médio</p>
                        <div class="space-y-3">
                            <div>
                                <label class="text-[9px] font-bold block leading-tight">BANHO / TOSA HIGIÊNICA</label>
                                <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-full border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold block leading-tight">BANHO + TOSA (GERAL)</label>
                                <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-full border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- COLUNA 2: CÃES GRANDES -->
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p class="text-[10px] font-black uppercase text-slate-500 mb-3 border-b pb-1">🐕 Cães Grandes (Somente Banho)</p>
                        <div class="space-y-3">
                            <div>
                                <label class="text-[9px] font-bold block leading-tight">GRANDE PELO CURTO</label>
                                <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-full border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold block leading-tight">GRANDE PELUDO</label>
                                <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-full border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- COLUNA 3: GATOS E AVULSO -->
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p class="text-[10px] font-black uppercase text-blue-600 mb-3 border-b border-blue-200 pb-1">🐱 Gatos / Outros</p>
                        <div class="space-y-3">
                            <div>
                                <label class="text-[9px] font-bold block leading-tight text-blue-700">VAGAS PARA GATOS (BANHO)</label>
                                <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-full border-blue-200 border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-blue-500 outline-none text-blue-700">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold block leading-tight text-slate-600">SOMENTE BANHO (QUALQUER PORTE)</label>
                                <input type="number" value="${v.vagas_banho || 0}" onchange="upVaga(${v.id}, 'vagas_banho', this.value)" class="w-full border rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-slate-500 outline-none">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html + `</div>`;
};

    container.innerHTML = html + `</div>`;
};
   
/**
 * ETAPA: GESTÃO DE VAGAS (SOMENTE ESTA FUNÇÃO)
 */

window.renderVagas = function(container) {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let html = `<div class="card-pet">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
            <div class="flex gap-2">
                <button onclick="alert('✅ Configurações Salvas!')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">Salvar Alterações 💾</button>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
        </div>`;

    for (let i = 0; i <= 6; i++) {
        const itens = todosDados.filter(v => v.dia_semana == i);
        html += `<div class="mb-8 border-l-4 ${itens.length ? 'border-red-600' : 'border-slate-200'} pl-4">
            <h4 class="font-black ${itens.length ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">${dias[i]}</h4>`;
        
        itens.forEach(v => {
            html += `<div class="bg-white p-4 rounded-xl border mb-4 shadow-sm text-black border-slate-300">
                <div class="flex justify-between border-b border-dashed pb-2 mb-4">
                    <span class="font-black text-xl text-slate-800">${v.horario}</span>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)">
                        <label class="text-[10px] font-black uppercase text-red-600">Bloquear</label>
                        <button onclick="removerHorario(${v.id})" class="text-slate-300 hover:text-red-600 transition">✕</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <!-- BLOCO 1: CACHORRO PEQUENO/MEDIO -->
                    <div class="bg-slate-50 p-3 rounded-lg border">
                        <p class="text-[9px] font-black uppercase text-slate-500 mb-2">🐶 Cão Pequeno / Médio</p>
                        
                        <label class="text-[8px] font-bold block">BANHO / TOSA HIGIÊNICA</label>
                        <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-full border rounded p-1 text-center font-bold mb-2">
                        
                        <label class="text-[8px] font-bold block">BANHO + TOSA</label>
                        <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-full border rounded p-1 text-center font-bold">
                    </div>

                    <!-- BLOCO 2: CACHORRO GRANDE -->
                    <div class="bg-slate-50 p-3 rounded-lg border">
                        <p class="text-[9px] font-black uppercase text-slate-500 mb-2">🐕 Cão Grande (Somente Banho)</p>
                        
                        <label class="text-[8px] font-bold block">GRANDE PELO CURTO</label>
                        <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-full border rounded p-1 text-center font-bold mb-2">
                        
                        <label class="text-[8px] font-bold block">GRANDE PELUDO</label>
                        <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-full border rounded p-1 text-center font-bold">
                    </div>

                    <!-- BLOCO 3: GATO E BANHO GERAL -->
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p class="text-[9px] font-black uppercase text-blue-600 mb-2">🐱 Gato / Avulso</p>
                        
                        <label class="text-[8px] font-bold block text-blue-700">GATO (BANHO)</label>
                        <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-full border rounded p-1 text-center font-bold mb-2 border-blue-200 text-blue-700">
                        
                        <label class="text-[8px] font-bold block text-slate-600">SOMENTE BANHO (QUALQUER)</label>
                        <input type="number" value="${v.vagas_banho || 0}" onchange="upVaga(${v.id}, 'vagas_banho', this.value)" class="w-full border rounded p-1 text-center font-bold">
                    </div>

                </div>
            </div>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html + `</div>`;
};

// FUNÇÕES DE SUPORTE NECESSÁRIAS
window.upVaga = async function(id, campo, valor) {
    await fetch(`${SB_URL}/configuracoes_agenda?id=eq.${id}`, { method: "PATCH", headers, body: JSON.stringify({ [campo]: valor }) });
};

window.adicionarNovoHorario = async function() {
    const d = prompt("Dia (0-Dom, 1-Seg, 2-Ter, 3-Qua, 4-Qui, 5-Sex, 6-Sab):");
    const h = prompt("Hora (ex: 09:00):");
    if(d && h) { 
        await fetch(`${SB_URL}/configuracoes_agenda`, { method: "POST", headers, body: JSON.stringify({ dia_semana: parseInt(d), horario: h }) });
        carregarDados();
    }
};

window.removerHorario = async function(id) {
    if(confirm("Excluir este horário?")) { 
        await fetch(`${SB_URL}/configuracoes_agenda?id=eq.${id}`, { method: "DELETE", headers }); 
        carregarDados(); 
    }
};
