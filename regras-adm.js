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
 * MÓDULO ADICIONAL: REGRAS ADM - GESTÃO DE BLOQUEIOS
 */
(function() {
    // Carrega dados existentes
    window.bloqueiosAgenda = JSON.parse(localStorage.getItem('nilo_bloqueios_adm')) || [];

    // 1. INJETOR DO BOTÃO NO MENU DE GESTÃO
    function injetarBotaoAdm() {
        const menuGestao = document.querySelector('.card-pet .flex.gap-2') || document.querySelector('.flex.gap-2');
        if (menuGestao && !document.getElementById('btnAbrirBloqueio')) {
            const btn = document.createElement('button');
            btn.id = "btnAbrirBloqueio";
            btn.className = "bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-red-600 transition-all flex items-center gap-2 shadow-sm";
            btn.innerHTML = `
                <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                BLOQUEAR HORÁRIO / DIA`;
            btn.onclick = (e) => { e.preventDefault(); abrirTelaBloqueioAdm(); };
            menuGestao.prepend(btn);
        }
    }
    setInterval(injetarBotaoAdm, 1000);

    // 2. TELA DE GESTÃO (LAYOUT DIVIDIDO)
    window.abrirTelaBloqueioAdm = function() {
        const container = document.getElementById('conteudo-principal');
        if (!container) return;

        container.innerHTML = `
        <div class="max-w-6xl mx-auto p-4 animate-in fade-in duration-300">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Regras de Bloqueio</h2>
                    <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">Painel Administrativo</p>
                </div>
                <button onclick="window.renderVagas(document.getElementById('conteudo-principal'))" 
                    class="bg-white border-2 border-slate-200 text-slate-600 px-6 py-2 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition-all">
                    ⬅ Voltar ao Menu
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- FORMULÁRIO -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h3 class="text-xs font-black text-red-600 uppercase mb-6 tracking-widest flex items-center gap-2">
                            <span class="w-2 h-2 bg-red-600 rounded-full"></span> Configurar Pausa
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Data Início / Dia</label>
                                <input type="date" id="adm_d1" class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none transition-all">
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Até (Opcional - Período)</label>
                                <input type="date" id="adm_d2" class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none transition-all">
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Hora Início</label>
                                    <input type="time" id="adm_h1" class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none transition-all">
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Hora Fim</label>
                                    <input type="time" id="adm_h2" class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-red-500 outline-none transition-all">
                                </div>
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Motivo do Bloqueio</label>
                                <textarea id="adm_mot" placeholder="EX: FERIADO OU FÉRIAS" class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 ring-red-500 outline-none resize-none transition-all uppercase"></textarea>
                            </div>

                            <button onclick="salvarBloqueioAdm()" class="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all">
                                Ativar Bloqueio Agora
                            </button>
                        </div>
                    </div>
                </div>

                <!-- LISTAGEM -->
                <div class="lg:col-span-8">
                    <div class="bg-slate-50 rounded-[32px] p-2 min-h-[500px] border-2 border-dashed border-slate-200">
                        <div id="lista-bloqueios-adm" class="space-y-3">
                            ${renderListaAdm()}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    };

    // 3. LÓGICA DE SALVAMENTO (TRATA OS 3 CASOS)
    window.salvarBloqueioAdm = function() {
        const d1 = document.getElementById('adm_d1').value;
        const d2 = document.getElementById('adm_d2').value;
        const h1 = document.getElementById('adm_h1').value;
        const h2 = document.getElementById('adm_h2').value;
        const mot = document.getElementById('adm_mot').value;

        if (!d1 || !mot) return alert("Preencha a data e o motivo!");

        const formata = (d) => d.split('-').reverse().join('/');
        let descricao = "";
        let tipo = "";

        if (d2 && d2 !== d1) {
            descricao = `PERÍODO: ${formata(d1)} ATÉ ${formata(d2)} (RETORNO DIA SEGUINTE)`;
            tipo = "PERÍODO";
        } else if (h1 && h2) {
            descricao = `HORÁRIO: ${formata(d1)} DAS ${h1} ÀS ${h2}`;
            tipo = "HORÁRIO";
        } else {
            descricao = `DIA INTEIRO: ${formata(d1)} (FECHADO)`;
            tipo = "DIA";
        }

        window.bloqueiosAgenda.unshift({
            id: Date.now(),
            descricao: descricao.toUpperCase(),
            motivo: mot.toUpperCase(),
            tipo: tipo
        });

        localStorage.setItem('nilo_bloqueios_adm', JSON.stringify(window.bloqueiosAgenda));
        abrirTelaBloqueioAdm();
    };

    window.excluirBloqueioAdm = function(id) {
        window.bloqueiosAgenda = window.bloqueiosAgenda.filter(b => b.id !== id);
        localStorage.setItem('nilo_bloqueios_adm', JSON.stringify(window.bloqueiosAgenda));
        abrirTelaBloqueioAdm();
    };

    function renderListaAdm() {
        if (!window.bloqueiosAgenda.length) {
            return `<div class="flex flex-col items-center justify-center py-32 opacity-20">
                <p class="font-black uppercase text-sm tracking-[0.3em]">Sem Bloqueios Ativos</p>
            </div>`;
        }
        
        return window.bloqueiosAgenda.map(b => `
            <div class="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border-l-8 ${b.tipo === 'PERÍODO' ? 'border-l-orange-500' : 'border-l-red-600'}">
                <div>
                    <p class="font-black text-slate-800 text-base leading-tight">${b.descricao}</p>
                    <p class="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">MOTIVO: ${b.motivo}</p>
                </div>
                <button onclick="excluirBloqueioAdm(${b.id})" class="bg-slate-50 text-slate-400 hover:text-red-600 p-3 rounded-xl transition-all">
                    <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>`).join('');
    }
})();
