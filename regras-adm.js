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
 * REGRAS ADICIONAIS - GESTÃO DE VAGAS AVANÇADA
 * Este código substitui a gestão de vagas original por uma personalizada.
 */
/**
 * REGRAS ADICIONAIS - GESTÃO DE VAGAS COMPLETA (DIAS + SERVIÇOS)
 * Este código substitui a renderização original para incluir todos os dias e tipos de serviço.
 */

window.renderVagas = function(container) {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    let html = `
        <div class="card-pet">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
    `;

    // Loop por todos os 7 dias da semana (0 a 6)
    for (let diaNum = 0; diaNum <= 6; diaNum++) {
        const vagasDoDia = todosDados.filter(v => v.dia_semana == diaNum);
        
        html += `
            <div class="mb-8 border-l-4 ${vagasDoDia.length > 0 ? 'border-red-600' : 'border-slate-300'} pl-4">
                <h4 class="font-black ${vagasDoDia.length > 0 ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">
                    ${dias[diaNum]} ${vagasDoDia.length === 0 ? '(Sem horários)' : ''}
                </h4>
                <div class="grid grid-cols-1 gap-2">
        `;

        vagasDoDia.forEach(v => {
            html += `
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-black text-slate-700 text-lg">${v.horario}</span>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)">
                            <label class="text-[10px] font-black uppercase text-red-500">Bloquear Horário</label>
                            <button onclick="removerHorario(${v.id})" class="ml-4 text-slate-300 hover:text-red-600 font-bold">✕</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <!-- VAGAS POR PORTE (Cachorro) -->
                        <div class="space-y-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Porte / Espécie</p>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold">Pequeno/Médio</label>
                                <input type="number" value="${v.vagas_pequeno_medio || 0}" onchange="upVaga(${v.id}, 'vagas_pequeno_medio', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            </div>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold">Gato</label>
                                <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-full border rounded p-1 text-center font-bold border-blue-200">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Cães Grandes</p>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold">Grande Curto</label>
                                <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            </div>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold">Grande Peludo</label>
                                <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            </div>
                        </div>

                        <!-- VAGAS POR SERVIÇO -->
                        <div class="space-y-2 border-l pl-4">
                            <p class="text-[9px] font-black text-red-600 uppercase">Serviços</p>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold uppercase">Somente Banho</label>
                                <input type="number" value="${v.vagas_banho || 0}" onchange="upVaga(${v.id}, 'vagas_banho', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            </div>
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold uppercase">Tosa Higiênica</label>
                                <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-full border rounded p-1 text-center font-bold">
                            </div>
                        </div>

                        <div class="space-y-2 mt-4">
                            <div class="flex flex-col">
                                <label class="text-[8px] font-bold uppercase text-red-600">Banho + Tosa (Geral)</label>
                                <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-full border rounded p-1 text-center font-bold border-red-200">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
};

// As funções adicionarNovoHorario, upVaga e removerHorario continuam as mesmas do código anterior.
