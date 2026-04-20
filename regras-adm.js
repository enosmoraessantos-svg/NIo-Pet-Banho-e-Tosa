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
 * MÓDULO EXCLUSIVO: BLOQUEIO/DESBLOQUEIO (PAINEL ADM)
 */
(function() {
    window.bloqueiosAtivos = window.bloqueiosAtivos || [];

    // 1. Injeta o botão no menu lateral assim que o painel carregar
    function injetarBotaoMenu() {
        const menuLateral = document.querySelector('nav') || document.querySelector('.sidebar') || document.querySelector('#menuArea');
        if (menuLateral && !document.getElementById('btnBloqueioInjetado')) {
            const btn = document.createElement('button');
            btn.id = "btnBloqueioInjetado";
            btn.innerHTML = "🚫 BLOQUEAR HORÁRIO/DIA";
            btn.style = "width: 100%; padding: 12px; margin-bottom: 8px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-weight: 900; font-size: 11px; cursor: pointer; text-align: left; transition: 0.3s;";
            
            btn.onmouseover = () => btn.style.background = "#fecaca";
            btn.onmouseout = () => btn.style.background = "#fee2e2";
            btn.onclick = (e) => {
                e.preventDefault();
                window.abrirBloqueios();
            };
            
            menuLateral.appendChild(btn);
        }
    }
    window.addEventListener('load', injetarBotaoMenu);
    setTimeout(injetarBotaoMenu, 1500);

    // 2. Abre a tela de gerenciamento
    window.abrirBloqueios = function() {
        // Procure o container principal do seu sistema (ajuste o ID se necessário)
        const container = document.getElementById('conteudo-principal') || document.getElementById('main') || document.body;
        
        container.innerHTML = `
        <div style="padding: 25px; background: #fff; border-radius: 20px; color: #1e293b; font-family: sans-serif;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 22px; color: #ef4444;">🚫 Bloquear Horário / Dia</h2>
                <button onclick="location.reload()" style="background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 8px; font-weight: 800; cursor: pointer;">Sair ✕</button>
            </div>
            
            <!-- FORMULÁRIO DE BLOQUEIO -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border: 2px solid #f1f5f9; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase;">Data e Horário</label>
                    <input type="date" id="block_data" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input type="time" id="block_inicio" placeholder="Início" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                        <input type="time" id="block_fim" placeholder="Fim" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase;">Motivo do Bloqueio</label>
                    <textarea id="block_motivo" placeholder="Ex: Feriado, manutenção, almoço..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold; height: 85px;"></textarea>
                </div>
                <div style="grid-column: span 2;">
                    <button onclick="salvarNovoBloqueio()" style="width: 100%; background: #ef4444; color: #fff; border: none; padding: 15px; border-radius: 10px; font-weight: 900; text-transform: uppercase; cursor: pointer; font-size: 14px;">Confirmar e Bloquear Agenda 🔒</button>
                </div>
            </div>

            <!-- LISTAGEM -->
            <h3 style="font-weight: 900; text-transform: uppercase; font-size: 13px; color: #94a3b8; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Bloqueios Vigentes</h3>
            <div id="lista-bloqueios-painel">${renderizarBloqueiosPainel()}</div>
        </div>`;
    };

    window.salvarNovoBloqueio = function() {
        const d = document.getElementById('block_data').value;
        const m = document.getElementById('block_motivo').value;
        const i = document.getElementById('block_inicio').value || "00:00";
        const f = document.getElementById('block_fim').value || "23:59";

        if (!d || !m) return alert("⚠️ Preencha a DATA e o MOTIVO.");

        window.bloqueiosAtivos.unshift({ id: Date.now(), data: d, inicio: i, fim: f, motivo: m });
        window.abrirBloqueios();
        alert("✅ Horário bloqueado com sucesso!");
    };

    window.removerBloqueioPainel = function(id) {
        if (confirm("Deseja desbloquear este período?")) {
            window.bloqueiosAtivos = window.bloqueiosAtivos.filter(b => b.id !== id);
            window.abrirBloqueios();
        }
    };

    function renderizarBloqueiosPainel() {
        if (!window.bloqueiosAtivos.length) return `<p style="text-align: center; color: #cbd5e1; padding: 30px; font-weight: bold;">Nenhum bloqueio ativo.</p>`;
        return window.bloqueiosAtivos.map(b => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-left: 6px solid #ef4444; padding: 15px; border-radius: 12px; margin-bottom: 12px; shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div>
                    <span style="font-weight: 900; font-size: 17px; color: #1e293b;">${b.data.split('-').reverse().join('/')}</span>
                    <span style="margin-left: 10px; background: #fee2e2; color: #ef4444; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 900;">${b.inicio} - ${b.fim}</span>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #475569;"><b>Motivo:</b> ${b.motivo}</p>
                </div>
                <button onclick="removerBloqueioPainel(${b.id})" style="background: #fff; color: #ef4444; border: 1px solid #ef4444; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 10px; cursor: pointer; text-transform: uppercase;">Desbloquear 🔓</button>
            </div>
        `).join('');
    }
})();
