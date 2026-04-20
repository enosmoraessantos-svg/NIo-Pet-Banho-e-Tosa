/**
 * REGRAS ADICIONAIS - NILO PET ADM
 * Este arquivo modifica o comportamento do Login sem alterar o código principal.
 */

(function() {
    // 1. Configurações de Recuperação
    const CONFIG_RECUPERACAO = {
        pergunta: "Qual o nome da primeira mascote da Nilo Pet?",
        respostaCorreta: "nilo", // Altere aqui a resposta secreta
        senhaOriginal: "nilopet2024"
    };

    // Espera o DOM carregar para injetar os elementos
    window.addEventListener('load', () => {
        const loginCard = document.querySelector('#loginArea div');
        const btnEntrar = document.querySelector('#loginArea button');

        if (loginCard && btnEntrar) {
            // 2. Criar e Injetar o Botão "Esqueci a Senha"
            const btnEsqueci = document.createElement('button');
            btnEsqueci.innerText = "ESQUECI A SENHA";
            btnEsqueci.style = "font-size: 10px; color: #94a3b8; font-weight: 800; margin-top: 15px; cursor: pointer; text-transform: uppercase;";
            
            // Adiciona o botão logo após o botão de Entrar
            btnEntrar.parentNode.appendChild(btnEsqueci);

            // 3. Ação do Botão Esqueci a Senha
            btnEsqueci.onclick = () => {
                const respostaUser = prompt(CONFIG_RECUPERACAO.pergunta);
                
                if (respostaUser === null) return; // Cancelou

                if (respostaUser.toLowerCase().trim() === CONFIG_RECUPERACAO.respostaCorreta) {
                    alert("✅ VALIDAÇÃO COM SUCESSO!\nSua senha é: " + CONFIG_RECUPERACAO.senhaOriginal);
                } else {
                    alert("❌ RESPOSTA INCORRETA!\nEntre em contato com o suporte técnico.");
                }
            };
        }
    });

    console.log("✅ Regras Adicionais Carregadas: Recuperação de Senha Injetada.");
    /**
// --- INÍCIO DA ETAPA: GESTÃO DE VAGAS (Adicione ao final do arquivo) ---

window.renderVagas = function(container) {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let html = `
        <div class="card-pet">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
    `;

    // Loop forçado para mostrar todos os dias da semana (0 a 6)
    for (let i = 0; i <= 6; i++) {
        const itensDia = todosDados.filter(v => v.dia_semana == i);
        
        html += `
            <div class="mb-8 border-l-4 ${itensDia.length > 0 ? 'border-red-600' : 'border-slate-200'} pl-4">
                <h4 class="font-black ${itensDia.length > 0 ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">${dias[i]}</h4>
                <div class="grid grid-cols-1 gap-2">
        `;

        itensDia.forEach(v => {
            html += `
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-black text-slate-700 text-lg">${v.horario}</span>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)">
                            <label class="text-[10px] font-black uppercase text-red-500">Bloquear</label>
                            <button onclick="removerHorario(${v.id})" class="ml-4 text-slate-300 hover:text-red-600">✕</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <!-- PORTE E ESPÉCIE -->
                        <div class="space-y-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Porte / Espécie</p>
                            <label class="text-[8px] font-bold block">PEQUENO / MÉDIO</label>
                            <input type="number" value="${v.vagas_pequeno_medio || 0}" onchange="upVaga(${v.id}, 'vagas_pequeno_medio', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            <label class="text-[8px] font-bold block">GATO</label>
                            <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-full border rounded p-1 text-center font-bold border-blue-200">
                        </div>

                        <!-- CÃES GRANDES -->
                        <div class="space-y-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Cães Grandes</p>
                            <label class="text-[8px] font-bold block">GRANDE PELO CURTO</label>
                            <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            <label class="text-[8px] font-bold block">GRANDE PELUDO</label>
                            <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-full border rounded p-1 text-center font-bold">
                        </div>

                        <!-- SERVIÇOS -->
                        <div class="space-y-2 border-l pl-4">
                            <p class="text-[9px] font-black text-red-600 uppercase">Vagas por Serviço</p>
                            <label class="text-[8px] font-bold block">SOMENTE BANHO</label>
                            <input type="number" value="${v.vagas_banho || 0}" onchange="upVaga(${v.id}, 'vagas_banho', this.value)" class="w-full border rounded p-1 text-center font-bold border-red-100">
                            <label class="text-[8px] font-bold block">TOSA HIGIÊNICA</label>
                            <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-full border rounded p-1 text-center font-bold border-red-100">
                            <label class="text-[8px] font-bold block">BANHO + TOSA (GERAL)</label>
                            <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-full border rounded p-1 text-center font-bold border-red-200">
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html + "</div>";
};

// Funções de salvamento para esta etapa
window.adicionarNovoHorario = async function() {
    const d = prompt("Dia (0-Dom, 1-Seg, 2-Ter, 3-Qua, 4-Qui, 5-Sex, 6-Sab):");
    const h = prompt("Horário (ex: 08:30):");
    if (d && h) {
        await fetch(`${SB_URL}/configuracoes_agenda`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ dia_semana: parseInt(d), horario: h })
        });
        carregarDados();
    }
};

window.removerHorario = async function(id) {
    if(confirm("Deseja excluir este horário?")) {
        await fetch(`${SB_URL}/configuracoes_agenda?id=eq.${id}`, { method: "DELETE", headers });
        carregarDados();
    }
};

window.upVaga = async function(id, campo, valor) {
    await fetch(`${SB_URL}/configuracoes_agenda?id=eq.${id}`, { 
        method: "PATCH", 
        headers: headers, 
        body: JSON.stringify({ [campo]: valor }) 
    });
};
