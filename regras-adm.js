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
 * MÓDULO DE BLOQUEIOS NILO PET - VERSÃO AVANÇADA
 */
(function() {
    window.bloqueiosAtivos = window.bloqueiosAtivos || [];

    // 1. INJEÇÃO DO BOTÃO ACIMA DO "SAIR"
    function injetarBotaoBloqueio() {
        const botoesMenu = document.querySelectorAll('button');
        let btnSair = null;
        
        // Localiza o botão "Sair" pelo texto
        botoesMenu.forEach(btn => {
            if (btn.innerText.toUpperCase().includes('SAIR')) btnSair = btn;
        });

        if (btnSair && !document.getElementById('btnBloqueioPainel')) {
            const btnBlock = document.createElement('button');
            btnBlock.id = "btnBloqueioPainel";
            btnBlock.innerHTML = "🚫 BLOQUEAR HORÁRIO / DIA";
            btnBlock.style = "width: 100%; padding: 12px; margin-bottom: 10px; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: 900; font-size: 11px; cursor: pointer; text-transform: uppercase; display: block;";
            
            btnBlock.onclick = (e) => {
                e.preventDefault();
                window.abrirBloqueios();
            };
            
            btnSair.parentNode.insertBefore(btnBlock, btnSair);
        }
    }
    window.addEventListener('load', injetarBotaoBloqueio);
    setInterval(injetarBotaoBloqueio, 2000); // Garante que o botão apareça

    // 2. TELA DE BLOQUEIOS
    window.abrirBloqueios = function() {
        const container = document.getElementById('conteudo-principal') || document.body;
        
        container.innerHTML = `
        <div style="padding: 20px; background: #fff; font-family: sans-serif; color: #1e293b;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-weight: 900; text-transform: uppercase; font-style: italic; color: #dc2626;">🚫 Gestão de Bloqueios</h2>
                <button onclick="location.reload()" style="background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 11px;">⬅ Voltar ao Menu</button>
            </div>

            <!-- FORMULÁRIO -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border: 2px solid #e2e8f0; margin-bottom: 30px;">
                <p style="font-weight: 900; font-size: 12px; text-transform: uppercase; color: #475569; margin-bottom: 15px;">Deseja Bloquear:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <label style="font-size: 10px; font-weight: 900; color: #94a3b8;">DATA INICIAL (OU DIA ÚNICO)</label>
                        <input type="date" id="block_data_inicio" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                        
                        <label style="font-size: 10px; font-weight: 900; color: #94a3b8;">DATA FINAL (PARA PERÍODOS/FÉRIAS)</label>
                        <input type="date" id="block_data_fim" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                        <small style="color: #94a3b8; font-size: 9px;">* Deixe em branco se for apenas um dia</small>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; gap: 10px;">
                            <div style="flex:1">
                                <label style="font-size: 10px; font-weight: 900; color: #94a3b8;">HORA INÍCIO</label>
                                <input type="time" id="block_hora_inicio" style="width:100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                            </div>
                            <div style="flex:1">
                                <label style="font-size: 10px; font-weight: 900; color: #94a3b8;">HORA FIM</label>
                                <input type="time" id="block_hora_fim" style="width:100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold;">
                            </div>
                        </div>
                        <label style="font-size: 10px; font-weight: 900; color: #94a3b8;">MOTIVO / AVISO</label>
                        <textarea id="block_motivo" placeholder="Ex: Férias, voltamos dia 16/10" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold; height: 60px;"></textarea>
                    </div>
                </div>

                <button onclick="confirmarBloqueio()" style="width: 100%; background: #dc2626; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: 900; text-transform: uppercase; cursor: pointer; margin-top: 20px;">Confirmar Bloqueio 🔒</button>
            </div>

            <h3 style="font-weight: 900; text-transform: uppercase; font-size: 12px; color: #64748b; border-bottom: 2px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 15px;">Bloqueios Vigentes</h3>
            <div id="lista-viva">${renderizarListaViva()}</div>
        </div>`;
    };

    window.confirmarBloqueio = function() {
        const d1 = document.getElementById('block_data_inicio').value;
        const d2 = document.getElementById('block_data_fim').value;
        const h1 = document.getElementById('block_hora_inicio').value;
        const h2 = document.getElementById('block_hora_fim').value;
        const mot = document.getElementById('block_motivo').value;

        if (!d1 || !mot) return alert("Preencha ao menos a data inicial e o motivo.");

        let textoDestaque = "";
        if (d2 && d2 !== d1) {
            textoDestaque = `PERÍODO: ${formatar(d1)} até ${formatar(d2)}`;
        } else if (h1 && h2) {
            textoDestaque = `HORÁRIO: ${formatar(d1)} das ${h1} às ${h2}`;
        } else {
            textoDestaque = `DIA TODO: ${formatar(d1)} (Fechado)`;
        }

        window.bloqueiosAtivos.unshift({
            id: Date.now(),
            display: textoDestaque,
            motivo: mot,
            expiracao: d2 || d1
        });

        window.abrirBloqueios();
    };

    window.removerBloqueioViva = function(id) {
        window.bloqueiosAtivos = window.bloqueiosAtivos.filter(b => b.id !== id);
        window.abrirBloqueios();
    };

    function renderizarListaViva() {
        if (!window.bloqueiosAtivos.length) return `<p style="text-align: center; color: #cbd5e1; padding: 20px;">Nenhum bloqueio registrado.</p>`;
        return window.bloqueiosAtivos.map(b => `
            <div style="background: white; border: 1px solid #e2e8f0; border-left: 6px solid #dc2626; padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: 900; font-size: 15px; margin: 0; color: #1e293b;">${b.display}</p>
                    <p style="font-size: 13px; margin: 3px 0 0 0; color: #64748b;"><b>Motivo:</b> ${b.motivo}</p>
                </div>
                <button onclick="removerBloqueioViva(${b.id})" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; font-weight: 900; font-size: 10px; cursor: pointer;">DESBLOQUEAR</button>
            </div>
        `).join('');
    }

    function formatar(data) { return data.split('-').reverse().join('/'); }
})();

