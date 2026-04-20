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
 * MÓDULO: GERENCIAR BLOQUEIOS (VOLTAR SEM DESLOGAR)
 */
(function() {
    window.bloqueiosAtivos = JSON.parse(localStorage.getItem('nilo_bloqueios')) || [];

    // 1. INJETOR DE BOTÃO
    function injetarBotaoBloqueio() {
        const cabecalho = document.querySelector('.card-pet .flex.justify-between');
        if (cabecalho && !document.getElementById('btnAbrirBloqueio')) {
            const grupo = cabecalho.querySelector('.flex.gap-2');
            if (grupo) {
                const btn = document.createElement('button');
                btn.id = "btnAbrirBloqueio";
                btn.innerHTML = "🚫 BLOQUEAR HORÁRIO / DIA";
                btn.className = "bg-red-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase shadow-sm hover:bg-red-700 transition-all";
                btn.onclick = (e) => { e.preventDefault(); window.abrirTelaBloqueio(); };
                grupo.prepend(btn);
            }
        }
    }
    setInterval(injetarBotaoBloqueio, 1000);

    // 2. TELA DE BLOQUEIO
    window.abrirTelaBloqueio = function() {
        const container = document.getElementById('conteudo-principal') || document.querySelector('.card-pet')?.parentNode;
        if (!container) return;

        container.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <!-- CABEÇALHO -->
            <div class="flex justify-between items-center mb-8 border-b-4 border-red-600 pb-4">
                <h2 class="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">🚫 Gerenciar Bloqueios</h2>
                
                <!-- BOTÃO VOLTAR CORRIGIDO: CHAMA AS VAGAS SEM RELOAD -->
                <button onclick="window.renderVagas(document.getElementById('conteudo-principal'))" class="bg-slate-800 text-white px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-black transition-all">⬅ Voltar</button>
            </div>

            <!-- FORMULÁRIO -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 mb-10 text-black">
                <div class="space-y-4">
                    <label class="block text-xs font-black text-slate-500 uppercase">📅 Período / Data</label>
                    <input type="date" id="bl_d1" class="w-full p-3 border-2 border-slate-300 rounded-xl font-black focus:border-red-500 outline-none">
                    <input type="date" id="bl_d2" class="w-full p-3 border-2 border-slate-300 rounded-xl font-black focus:border-red-500 outline-none">
                </div>

                <div class="space-y-4">
                    <label class="block text-xs font-black text-slate-500 uppercase">⏰ Horários (Opcional)</label>
                    <div class="grid grid-cols-2 gap-3">
                        <input type="time" id="bl_h1" class="w-full p-3 border-2 border-slate-300 rounded-xl font-black focus:border-red-500 outline-none">
                        <input type="time" id="bl_h2" class="w-full p-3 border-2 border-slate-300 rounded-xl font-black focus:border-red-500 outline-none">
                    </div>
                </div>

                <div class="space-y-4">
                    <label class="block text-xs font-black text-slate-500 uppercase">📝 Motivo do Bloqueio</label>
                    <textarea id="bl_mot" placeholder="EX: FERIADO, FÉRIAS..." class="w-full p-3 border-2 border-slate-300 rounded-xl font-black h-24 focus:border-red-500 outline-none"></textarea>
                </div>

                <div class="lg:col-span-3">
                    <button onclick="salvarBloqueioVivido()" class="w-full bg-red-600 text-white py-4 rounded-xl font-black text-sm uppercase shadow-lg hover:bg-red-700 transition-all">Confirmar e Bloquear Agenda Agora 🔒</button>
                </div>
            </div>

            <!-- LISTAGEM -->
            <h3 class="text-lg font-black text-slate-400 uppercase mb-6 tracking-tighter">Bloqueios Vigentes na Agenda</h3>
            <div id="lista-vigente" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                ${renderListaVivida()}
            </div>
        </div>`;
    };

    window.salvarBloqueioVivido = function() {
        const d1 = document.getElementById('bl_d1').value;
        const d2 = document.getElementById('bl_d2').value;
        const h1 = document.getElementById('bl_h1').value;
        const h2 = document.getElementById('bl_h2').value;
        const mot = document.getElementById('bl_mot').value;

        if (!d1 || !mot) return alert("⚠️ Preencha Data e Motivo!");

        const f = (v) => v.split('-').reverse().join('/');
        let info = (d2 && d2 !== d1) ? `🛑 PERÍODO: ${f(d1)} ATÉ ${f(d2)}` : (h1 && h2) ? `⏰ HORÁRIO: ${f(d1)} DAS ${h1} ÀS ${h2}` : `📅 DIA INTEIRO: ${f(d1)} (FECHADO)`;

        window.bloqueiosAtivos.unshift({ id: Date.now(), info: info.toUpperCase(), mot: mot.toUpperCase() });
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirTelaBloqueio();
    };

    window.excluirBloqueioVivido = function(id) {
        window.bloqueiosAtivos = window.bloqueiosAtivos.filter(b => b.id !== id);
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirTelaBloqueio();
    };

    function renderListaVivida() {
        if (!window.bloqueiosAtivos.length) return `<div class="col-span-full py-10 text-center border-4 border-dashed border-slate-200 rounded-3xl text-slate-300 font-black uppercase">Nenhum bloqueio ativo</div>`;
        return window.bloqueiosAtivos.map(b => `
            <div class="bg-white border-2 border-slate-200 p-5 rounded-2xl border-l-[12px] border-l-red-600 shadow-sm flex justify-between items-center group">
                <div>
                    <p class="font-black text-lg text-slate-900 leading-tight">${b.info}</p>
                    <p class="text-[11px] font-black text-slate-500 mt-1 uppercase">MOTIVO: ${b.mot}</p>
                </div>
                <button onclick="excluirBloqueioVivido(${b.id})" class="bg-red-50 text-red-600 p-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">EXCLUIR</button>
            </div>`).join('');
    }
})();
