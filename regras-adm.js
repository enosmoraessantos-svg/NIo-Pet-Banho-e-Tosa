/**
 * MÓDULO 1: RECUPERAÇÃO DE SENHA
 */
(function() {
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
            btnEsqueci.style = "font-size: 10px; color: #94a3b8; font-weight: 800; margin-top: 15px; cursor: pointer; text-transform: uppercase; display: block; width: 100%; border:none; background:none;";
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
})();
/**
 * MÓDULO 2: GESTÃO DE VAGAS (AGENDA) - VERSÃO LIMPA COM HORÁRIO EM DESTAQUE
 */

// --- FUNÇÃO PARA O BOTÃO "+ NOVO HORÁRIO" ---
window.adicionarNovoHorario = function() {
    const hora = prompt("Digite o horário (ex: 09:00):");
    if (!hora) return;
    
    const dia = prompt("Digite o número do dia (0 para Domingo, 1 para Segunda... 6 para Sábado):");
    if (dia === null || dia === "" || dia < 0 || dia > 6) {
        alert("Dia inválido!");
        return;
    }

    const novoItem = {
        id: Date.now(),
        dia_semana: parseInt(dia),
        horario: hora,
        vagas_pequeno_medio: 0,
        vagas_tosa_higi: 0,
        vagas_tosa: 0,
        vagas_grande_curto: 0,
        vagas_grande_peludo: 0,
        vagas_gato: 0
    };

    if (typeof todosDados !== 'undefined') {
        todosDados.push(novoItem);
        const containerAtivo = document.querySelector('.card-pet')?.parentNode;
        if (containerAtivo) window.renderVagas(containerAtivo);
        alert("Horário adicionado e organizado!");
    }
};

// --- RENDERIZAÇÃO ---
window.renderVagas = function(container) {
    if (!container) return;

    // ORDENA OS DADOS POR HORÁRIO
    if (typeof todosDados !== 'undefined') {
        todosDados.sort((a, b) => a.horario.localeCompare(b.horario));
    }

    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let html = `<div class="card-pet">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
            <div class="flex gap-2">
                <button onclick="alert('✅ Alterações salvas com sucesso!')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">Salvar Alterações 💾</button>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
        </div>`;

    for (let i = 0; i <= 6; i++) {
        const itens = (typeof todosDados !== 'undefined') ? todosDados.filter(v => v.dia_semana == i) : [];
        
        html += `<div class="mb-8 border-l-4 ${itens.length ? 'border-red-600' : 'border-slate-200'} pl-4">
            <h4 class="font-black ${itens.length ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">${dias[i]}</h4>`;
        
        itens.forEach(v => {
            html += `
            <div class="bg-white p-4 rounded-xl border mb-3 shadow-sm text-black">
                <div class="flex justify-between items-center mb-2">
                    <!-- HORÁRIO COM NEGRITO FORÇADO VIA TEXT-SHADOW -->
                    <span style="font-weight: 900; font-size: 1.6rem; text-shadow: 1px 0px 0px black, -1px 0px 0px black; letter-spacing: 1px;" class="text-black">${v.horario}</span>
                    <span class="font-black text-sm text-slate-500 uppercase ml-2 flex-1">- CACHORRO / GATO</span>
                    
                    <div class="flex items-center gap-2">
                         <button onclick="removerHorario(${v.id})" class="ml-2 text-slate-300 text-xl font-bold">✕</button>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="bg-slate-50 p-2 rounded-lg border-l-2 border-blue-400">
                        <p class="font-black text-[10px] uppercase text-slate-600 mb-1">🐶 PORTE PEQUENO / MÉDIO</p>
                        <div class="flex flex-wrap gap-4 text-[11px] font-bold">
                            <div class="flex items-center gap-1">
                                <span>BANHO / TOSA HIGI:</span>
                                <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-8 border-b text-center bg-transparent">
                            </div>
                            <div class="flex items-center gap-1">
                                <span>BANHO + TOSA:</span>
                                <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-8 border-b text-center bg-transparent">
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-2 rounded-lg border-l-2 border-orange-400">
                        <p class="font-black text-[10px] uppercase text-slate-600 mb-1">🐕 PORTE GRANDE</p>
                        <div class="flex flex-wrap gap-4 text-[11px] font-bold">
                            <div class="flex items-center gap-1">
                                <span>PELO CURTO (BANHO):</span>
                                <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-8 border-b text-center bg-transparent">
                            </div>
                            <div class="flex items-center gap-1">
                                <span>PELUDO (BANHO):</span>
                                <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-8 border-b text-center bg-transparent">
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-2 rounded-lg border-l-2 border-purple-400">
                        <p class="font-black text-[10px] uppercase text-slate-600 mb-1">🐱 GATOS</p>
                        <div class="flex items-center gap-1 text-[11px] font-bold">
                            <span>SOMENTE BANHO:</span>
                            <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-8 border-b text-center bg-transparent">
                        </div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html + `</div>`;
};
/**
 * MÓDULO: GESTÃO DE BLOQUEIOS (INTEGRADO)
 */
(function() {
    window.bloqueiosAtivos = JSON.parse(localStorage.getItem('nilo_bloqueios')) || [];

    // 1. INJETOR DE BOTÃO (Dentro da área de Gestão de Vagas)
    function injetarBotaoBloqueio() {
        // Busca o cabeçalho dentro do card de gestão
        const cabecalho = document.querySelector('.card-pet .flex.justify-between');
        if (cabecalho && !document.getElementById('btnAbrirBloqueio')) {
            const grupo = cabecalho.querySelector('.flex.gap-2') || cabecalho;
            
            const btn = document.createElement('button');
            btn.id = "btnAbrirBloqueio";
            btn.innerHTML = `
                <span class="flex items-center gap-2">
                    <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    BLOQUEAR AGENDA
                </span>`;
            btn.className = "bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-red-600 transition-all shadow-sm";
            btn.onclick = (e) => { e.preventDefault(); window.abrirTelaBloqueio(); };
            
            grupo.prepend(btn);
        }
    }
    setInterval(injetarBotaoBloqueio, 1000);

    // 2. TELA DE BLOQUEIO (LAYOUT LIMPO)
    window.abrirTelaBloqueio = function() {
        const container = document.getElementById('conteudo-principal');
        if (!container) return;

        container.innerHTML = `
        <div class="max-w-5xl mx-auto animate-in fade-in duration-300">
            <!-- HEADER DA SEÇÃO -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tighter">GESTÃO DE BLOQUEIOS</h2>
                    <p class="text-slate-500 text-sm font-medium">Impeça novos agendamentos em datas específicas.</p>
                </div>
                
                <button onclick="window.renderVagas(document.getElementById('conteudo-principal'))" 
                    class="bg-white border-2 border-slate-200 text-slate-600 px-5 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition-all flex items-center gap-2">
                    ⬅ Voltar para Vagas
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <!-- COLUNA ESQUERDA: FORMULÁRIO (4/12) -->
                <div class="lg:col-span-4 space-y-4">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 class="text-xs font-black text-red-600 uppercase mb-4 tracking-widest">Novo Bloqueio</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Data Início</label>
                                <input type="date" id="bl_d1" class="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none">
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Data Fim (Opcional)</label>
                                <input type="date" id="bl_d2" class="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none">
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Das</label>
                                    <input type="time" id="bl_h1" class="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none">
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Até</label>
                                    <input type="time" id="bl_h2" class="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none">
                                </div>
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Motivo</label>
                                <textarea id="bl_mot" placeholder="Ex: Feriado Municipal" class="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-20 focus:ring-2 ring-red-500 outline-none resize-none"></textarea>
                            </div>

                            <button onclick="salvarBloqueioVivido()" class="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-red-200 hover:bg-red-700 transition-all mt-2">
                                Confirmar Bloqueio
                            </button>
                        </div>
                    </div>
                </div>

                <!-- COLUNA DIREITA: LISTAGEM (8/12) -->
                <div class="lg:col-span-8">
                    <div class="bg-slate-50 p-1 rounded-3xl min-h-[400px]">
                        <div id="lista-vigente" class="space-y-3 p-2">
                            ${renderListaVivida()}
                        </div>
                    </div>
                </div>

            </div>
        </div>`;
    };

    window.salvarBloqueioVivido = function() {
        const d1 = document.getElementById('bl_d1').value;
        const d2 = document.getElementById('bl_d2').value;
        const h1 = document.getElementById('bl_h1').value;
        const h2 = document.getElementById('bl_h2').value;
        const mot = document.getElementById('bl_mot').value;

        if (!d1 || !mot) return alert("⚠️ Informe pelo menos a Data de Início e o Motivo!");

        const f = (v) => v.split('-').reverse().join('/');
        let info = "";
        
        if (d2 && d2 !== d1) {
            info = `PERÍODO: ${f(d1)} - ${f(d2)}`;
        } else if (h1 && h2) {
            info = `DIA ${f(d1)}: ${h1} ÀS ${h2}`;
        } else {
            info = `DIA INTEIRO: ${f(d1)}`;
        }

        window.bloqueiosAtivos.unshift({ 
            id: Date.now(), 
            info: info.toUpperCase(), 
            mot: mot.toUpperCase(),
            dataCriacao: new Date().toLocaleDateString()
        });

        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirTelaBloqueio();
    };

    window.excluirBloqueioVivido = function(id) {
        window.bloqueiosAtivos = window.bloqueiosAtivos.filter(b => b.id !== id);
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirTelaBloqueio();
    };

    function renderListaVivida() {
        if (!window.bloqueiosAtivos.length) {
            return `
            <div class="flex flex-col items-center justify-center py-20 text-slate-300">
                <svg xmlns="http://w3.org" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <p class="font-bold uppercase text-xs tracking-widest">Nenhum bloqueio registrado</p>
            </div>`;
        }
        
        return window.bloqueiosAtivos.map(b => `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center animate-in slide-in-from-right-4 duration-300">
                <div class="flex items-center gap-4">
                    <div class="bg-red-50 text-red-600 p-3 rounded-xl">
                        <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    </div>
                    <div>
                        <p class="font-black text-slate-800 text-sm leading-tight">${b.info}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">MOTIVO: ${b.mot}</p>
                    </div>
                </div>
                <button onclick="excluirBloqueioVivido(${b.id})" class="text-slate-300 hover:text-red-600 p-2 transition-colors">
                    <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>`).join('');
    }
})();
