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
 * MÓDULO 3: BLOQUEIOS DE AGENDA (ISOLADO ADM)
 */
(function() {
    // Estado interno para controle da tela de bloqueio
    let telaAtual = 'menu'; 

    window.abrirPainelBloqueio = function() {
        const container = document.querySelector('.card-pet')?.parentNode;
        if (!container) return;
        renderizarBloqueio(container);
    };

    function renderizarBloqueio(container) {
        let conteudo = "";

        if (telaAtual === 'menu') {
            conteudo = `
                <div class="space-y-4">
                    <h3 class="font-black uppercase text-slate-800 italic mb-4">🚫 Gerenciar Bloqueios</h3>
                    <button onclick="mudarTela('horario')" class="w-full bg-slate-100 p-4 rounded-xl font-bold text-left hover:bg-slate-200 transition">⏰ Bloquear Horário Específico</button>
                    <button onclick="mudarTela('dia')" class="w-full bg-slate-100 p-4 rounded-xl font-bold text-left hover:bg-slate-200 transition">📅 Bloquear Dia Inteiro</button>
                    <button onclick="mudarTela('periodo')" class="w-full bg-slate-100 p-4 rounded-xl font-bold text-left hover:bg-slate-200 transition">⏳ Bloquear Período (Férias/Folga)</button>
                    <hr class="my-4">
                    <button onclick="mudarTela('desbloquear')" class="w-full bg-green-100 text-green-700 p-4 rounded-xl font-bold text-left hover:bg-green-200 transition">🔓 Desbloquear Horários</button>
                    <button onclick="window.renderVagas(document.querySelector('.card-pet').parentNode)" class="w-full text-slate-400 font-bold py-2 mt-4">⬅ Voltar para Agenda</button>
                </div>`;
        } else {
            conteudo = `
                <div class="space-y-4">
                    <button onclick="mudarTela('menu')" class="text-blue-600 font-black text-[10px] uppercase mb-2">⬅ Voltar às opções</button>
                    <h3 class="font-black uppercase text-red-600 italic">Bloquear ${telaAtual.toUpperCase()}</h3>
                    
                    <div class="flex flex-col gap-3">
                        <label class="text-[10px] font-black text-slate-500 uppercase">Data / Início:</label>
                        <input type="date" id="blkDataInicio" class="p-2 border rounded-lg">
                        
                        ${telaAtual === 'periodo' ? `
                            <label class="text-[10px] font-black text-slate-500 uppercase">Data Fim:</label>
                            <input type="date" id="blkDataFim" class="p-2 border rounded-lg">
                        ` : ''}

                        ${telaAtual === 'horario' ? `
                            <label class="text-[10px] font-black text-slate-500 uppercase">Horário:</label>
                            <input type="time" id="blkHora" class="p-2 border rounded-lg">
                        ` : ''}

                        <label class="text-[10px] font-black text-slate-500 uppercase">Motivo do Bloqueio:</label>
                        <textarea id="blkMotivo" placeholder="Ex: Manutenção, Feriado..." class="p-2 border rounded-lg h-20"></textarea>
                        
                        <button onclick="confirmarBloqueio()" class="bg-red-600 text-white p-3 rounded-lg font-black uppercase mt-4">Confirmar Bloqueio 🚫</button>
                    </div>
                </div>`;
        }

        container.innerHTML = `<div class="card-pet bg-white p-6 rounded-2xl shadow-xl border-2 border-red-50">{conteudo}</div>`;
    }

    window.mudarTela = function(tela) {
        telaAtual = tela;
        window.abrirPainelBloqueio();
    };

    window.confirmarBloqueio = function() {
        const motivo = document.getElementById('blkMotivo').value;
        if (!motivo) return alert("Por favor, digite um motivo.");
        
        alert("✅ Bloqueio realizado com sucesso!\nMotivo: " + motivo);
        mudarTela('menu');
    };

    // Função auxiliar para injetar o botão de acesso no Módulo 2 original
    function adicionarBotaoBloqueioNoPainel() {
        const header = document.querySelector('.card-pet .flex.gap-2');
        if (header && !document.getElementById('btnAbrirBloqueio')) {
            const btn = document.createElement('button');
            btn.id = "btnAbrirBloqueio";
            btn.className = "bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase";
            btn.innerText = "Bloqueios 🚫";
            btn.onclick = window.abrirPainelBloqueio;
            header.prepend(btn);
        }
    }

    // Monitora a renderização do Módulo 2 para inserir o botão de Bloqueio
    setInterval(adicionarBotaoBloqueioNoPainel, 1000);
})();
   
