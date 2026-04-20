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
 * INJETOR DE BLOQUEIO - ESTILO PADRÃO NILO PET
 */
(function() {
    // 1. PERSISTÊNCIA DOS DADOS (SALVA NO NAVEGADOR)
    window.bloqueiosAtivos = JSON.parse(localStorage.getItem('nilo_bloqueios')) || [];

    // 2. INJETOR: COLOCA O BOTÃO COM O MESMO LAYOUT DOS OUTROS
    function injetarBotaoBloqueioPadrao() {
        // Localiza o cabeçalho da Gestão de Vagas
        const cabecalho = document.querySelector('.card-pet .flex.justify-between');
        
        if (cabecalho && !document.getElementById('btnBloqueioNilo')) {
            const grupoBotoes = cabecalho.querySelector('.flex.gap-2');
            if (grupoBotoes) {
                const btn = document.createElement('button');
                btn.id = "btnBloqueioNilo";
                btn.innerText = "🚫 BLOQUEAR HORÁRIO / DIA";
                
                // Usa exatamente as mesmas classes Tailwind do botão de Novo Horário
                btn.className = "bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase";
                
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.abrirPainelBloqueio();
                };

                // Insere no início do grupo de botões
                grupoBotoes.prepend(btn);
            }
        }
    }
    // Verifica a cada 1 segundo se a tela mudou
    setInterval(injetarBotaoBloqueioPadrao, 1000);

    // 3. TELA DE BLOQUEIO (MANTÉM O ESTILO DO PAINEL)
    window.abrirPainelBloqueio = function() {
        const container = document.getElementById('conteudo-principal') || document.body;
        
        container.innerHTML = `
        <div class="card-pet p-6 bg-white rounded-xl border shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black uppercase text-lg italic text-red-600">🚫 Gerenciar Bloqueios</h3>
                <button onclick="window.renderVagas(document.getElementById('conteudo-principal'))" class="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">⬅ Voltar para Agenda</button>
            </div>

            <div class="bg-slate-50 p-4 rounded-xl border mb-6 text-black">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Data ou Período</label>
                        <input type="date" id="data_ini" class="w-full border rounded p-2 mb-2 font-bold">
                        <input type="date" id="data_fim" class="w-full border rounded p-2 font-bold">
                        <p class="text-[8px] text-slate-400 mt-1 uppercase">* Segunda data apenas para períodos longos</p>
                    </div>
                    <div>
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Das</label>
                                <input type="time" id="hora_ini" class="w-full border rounded p-2 font-bold">
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Até</label>
                                <input type="time" id="hora_fim" class="w-full border rounded p-2 font-bold">
                            </div>
                        </div>
                        <label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Motivo / Aviso</label>
                        <textarea id="mot_block" placeholder="Ex: Feriado, Férias, Reforma..." class="w-full border rounded p-2 font-bold h-16"></textarea>
                    </div>
                </div>
                <button onclick="confirmarNovoBloqueio()" class="w-full bg-red-600 text-white py-3 rounded-lg font-black uppercase mt-4 text-xs shadow-md">Confirmar Bloqueio na Agenda 🔒</button>
            </div>

            <h4 class="font-black uppercase text-sm text-slate-400 mb-4 border-b pb-2">Bloqueios Vigentes</h4>
            <div id="lista-blocs" class="space-y-3">
                ${renderListaBloqueios()}
            </div>
        </div>`;
    };

    window.confirmarNovoBloqueio = function() {
        const d1 = document.getElementById('data_ini').value;
        const d2 = document.getElementById('data_fim').value;
        const h1 = document.getElementById('hora_ini').value;
        const h2 = document.getElementById('hora_fim').value;
        const mot = document.getElementById('mot_block').value;

        if (!d1 || !mot) return alert("⚠️ Informe a data e o motivo!");

        let info = "";
        const f = (val) => val.split('-').reverse().join('/');

        if (d2 && d2 !== d1) info = `🛑 PERÍODO: ${f(d1)} até ${f(d2)}`;
        else if (h1 && h2) info = `⏰ HORÁRIO: ${f(d1)} das ${h1} às ${h2}`;
        else info = `📅 DIA INTEIRO: ${f(d1)} (Fechado)`;

        window.bloqueiosAtivos.unshift({ id: Date.now(), info, mot });
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirPainelBloqueio();
    };

    window.apagarBloqueio = function(id) {
        window.bloqueiosAtivos = window.bloqueiosAtivos.filter(b => b.id !== id);
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.bloqueiosAtivos));
        window.abrirPainelBloqueio();
    };

    function renderListaBloqueios() {
        if (!window.bloqueiosAtivos.length) return `<p class="text-center text-slate-400 py-4 italic text-sm">Nenhum bloqueio registrado.</p>`;
        return window.bloqueiosAtivos.map(b => `
            <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-l-4 border-l-red-600 shadow-sm text-black">
                <div>
                    <p class="font-black text-sm text-red-600 uppercase">${b.info}</p>
                    <p class="text-xs font-bold text-slate-600 uppercase">MOTIVO: ${b.mot}</p>
                </div>
                <button onclick="apagarBloqueio(${b.id})" class="text-slate-300 hover:text-red-600 font-bold text-xs uppercase bg-slate-50 px-3 py-2 rounded-lg">Excluir</button>
            </div>`).join('');
    }
})();
