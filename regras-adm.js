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
 * MÓDULO 3: GESTÃO DE BLOQUEIOS (VERSÃO FINAL CONSOLIDADA)
 */
(function() {
    let telaBloqueioAtiva = 'menu';
    let containerReferencia = null;

    // 1. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
    window.listaBloqueios = JSON.parse(localStorage.getItem('nilo_bloqueios')) || [];

    const salvarNoNavegador = () => {
        localStorage.setItem('nilo_bloqueios', JSON.stringify(window.listaBloqueios));
    };

    // 2. FUNÇÕES AUXILIARES DE DATA
    const formatarDataBR = (dataUS) => {
        if (!dataUS) return "";
        const [ano, mes, dia] = dataUS.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const calcularAmanhaBR = (dataUS) => {
        let data = new Date(dataUS + 'T12:00:00');
        data.setDate(data.getDate() + 1);
        let d = String(data.getDate()).padStart(2, '0');
        let m = String(data.getMonth() + 1).padStart(2, '0');
        let a = data.getFullYear();
        return `${d}/${m}/${a}`;
    };

    // 3. INTERFACE PRINCIPAL
    window.abrirPainelBloqueio = function() {
        if (!containerReferencia) {
            containerReferencia = document.querySelector('.card-pet')?.parentElement;
        }
        const container = containerReferencia;
        if (!container) return alert("Erro: Abra a agenda primeiro!");

        let conteudo = "";

        if (telaBloqueioAtiva === 'menu') {
            conteudo = `
                <div style="background: white; padding: 20px; border-radius: 20px; border: 2px solid #fee2e2;">
                    <h3 style="font-weight: 900; text-transform: uppercase; color: #1e293b; font-style: italic; margin-bottom: 20px;">🚫 Gestão de Bloqueios</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="irParaBloqueio('horario')" style="background: #f1f5f9; padding: 15px; border-radius: 10px; font-weight: bold; border: none; text-align: left; cursor: pointer;">⏰ Bloquear Horário</button>
                        <button onclick="irParaBloqueio('dia')" style="background: #f1f5f9; padding: 15px; border-radius: 10px; font-weight: bold; border: none; text-align: left; cursor: pointer;">📅 Bloquear Dia Inteiro</button>
                        <button onclick="irParaBloqueio('periodo')" style="background: #f1f5f9; padding: 15px; border-radius: 10px; font-weight: bold; border: none; text-align: left; cursor: pointer;">⏳ Bloquear Período</button>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                        <button onclick="irParaBloqueio('desbloquear')" style="background: #f0fdf4; color: #166534; padding: 15px; border-radius: 10px; font-weight: bold; border: none; text-align: left; cursor: pointer;">🔓 Desbloquear (${window.listaBloqueios.length})</button>
                    </div>
                    <button onclick="voltarParaAgenda()" style="margin-top: 20px; width: 100%; color: #94a3b8; font-weight: 800; background: none; border: none; cursor: pointer; text-transform: uppercase; font-size: 10px;">⬅ Voltar para Agenda</button>
                </div>`;
        } 
        else if (telaBloqueioAtiva === 'desbloquear') {
            let itens = window.listaBloqueios.map((b, index) => `
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div style="line-height: 1.2;">
                        <div style="font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase;">${b.tipo}</div>
                        <div style="font-size: 12px; font-weight: 800; color: #1e293b;">${b.info}</div>
                        <div style="font-size: 11px; color: #64748b;">Motivo: ${b.motivo}</div>
                    </div>
                    <button onclick="removerBloqueio(${index})" style="background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; width: 32px; height: 32px; font-weight: bold; cursor: pointer;">✕</button>
                </div>
            `).join('');

            conteudo = `
                <div style="background: white; padding: 20px; border-radius: 20px; border: 2px solid #22c55e;">
                    <button onclick="irParaBloqueio('menu')" style="color: #2563eb; font-weight: 900; font-size: 10px; text-transform: uppercase; border: none; background: none; cursor: pointer; margin-bottom: 10px;">⬅ Voltar</button>
                    <h3 style="font-weight: 900; text-transform: uppercase; color: #166534; margin-bottom: 15px;">Itens Bloqueados</h3>
                    <div style="max-height: 300px; overflow-y: auto;">${itens || '<p style="text-align:center; font-size:12px; color:#94a3b8;">Nada bloqueado.</p>'}</div>
                </div>`;
        }
        else {
            conteudo = `
                <div style="background: white; padding: 20px; border-radius: 20px; border: 2px solid #ef4444;">
                    <button onclick="irParaBloqueio('menu')" style="color: #2563eb; font-weight: 900; font-size: 10px; text-transform: uppercase; border: none; background: none; cursor: pointer; margin-bottom: 10px;">⬅ Voltar</button>
                    <h3 style="font-weight: 900; text-transform: uppercase; color: #ef4444; margin-bottom: 15px;">Bloquear ${telaBloqueioAtiva.toUpperCase()}</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="font-size: 10px; font-weight: 900; color: #64748b;">DATA:</label>
                        <input type="date" id="blkDataInicio" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; width:100%; box-sizing:border-box;">
                        
                        ${telaBloqueioAtiva === 'periodo' ? `
                            <label style="font-size: 10px; font-weight: 900; color: #64748b;">DATA FINAL (ÚLTIMO DIA FECHADO):</label>
                            <input type="date" id="blkDataFim" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; width:100%; box-sizing:border-box;">
                        ` : ''}

                        ${telaBloqueioAtiva === 'horario' ? `
                            <div style="display: flex; gap: 10px;">
                                <div style="flex:1;"><label style="font-size: 10px; font-weight: 900;">DAS:</label><input type="time" id="blkHoraInicio" style="padding:10px; width:100%; border:1px solid #cbd5e1; border-radius:8px;"></div>
                                <div style="flex:1;"><label style="font-size: 10px; font-weight: 900;">ATÉ AS:</label><input type="time" id="blkHoraFim" style="padding:10px; width:100%; border:1px solid #cbd5e1; border-radius:8px;"></div>
                            </div>
                        ` : ''}

                        <label style="font-size: 10px; font-weight: 900; color: #64748b;">MOTIVO:</label>
                        <textarea id="blkMotivo" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; height: 60px; width:100%; box-sizing:border-box;"></textarea>
                        
                        <button onclick="confirmarNovoBloqueio('${telaBloqueioAtiva}')" style="background: #ef4444; color: white; padding: 15px; border-radius: 10px; font-weight: 900; border: none; text-transform: uppercase; cursor: pointer;">Confirmar Bloqueio 🚫</button>
                    </div>
                </div>`;
        }
        container.innerHTML = conteudo;
    };

    // 4. LÓGICA DE SALVAMENTO E RETORNO
    window.confirmarNovoBloqueio = function(tipo) {
        const d1 = document.getElementById('blkDataInicio').value;
        const mot = document.getElementById('blkMotivo').value;
        if (!d1 || !mot) return alert("Preencha os campos!");

        let info = formatarDataBR(d1);
        
        if (tipo === 'horario') {
            const h1 = document.getElementById('blkHoraInicio').value;
            const h2 = document.getElementById('blkHoraFim').value;
            info = `${formatarDataBR(d1)} (${h1} às ${h2})`;
        } else if (tipo === 'periodo') {
            const d2 = document.getElementById('blkDataFim').value;
            const dataRetorno = calcularAmanhaBR(d2);
            info = `De ${formatarDataBR(d1)} até ${formatarDataBR(d2)} (Retorno: ${dataRetorno})`;
            alert(`📢 MENSAGEM: Estaremos fechados de ${formatarDataBR(d1)} a ${formatarDataBR(d2)}. Retornaremos dia ${dataRetorno}.`);
        }

        window.listaBloqueios.push({ tipo, info, motivo: mot });
        salvarNoNavegador();
        irParaBloqueio('menu');
    };

    window.removerBloqueio = function(index) {
        window.listaBloqueios.splice(index, 1);
        salvarNoNavegador();
        irParaBloqueio('desbloquear');
    };

    window.irParaBloqueio = function(tela) {
        telaBloqueioAtiva = tela;
        window.abrirPainelBloqueio();
    };

    window.voltarParaAgenda = function() {
        if (typeof window.renderVagas === 'function') window.renderVagas(containerReferencia);
        else location.reload();
    };

    // 5. INJEÇÃO REFORÇADA
    function injetarBotao() {
        const btnNovo = document.querySelector('button[onclick*="adicionarNovoHorario"]');
        if (btnNovo && !document.getElementById('btnBloqueioGeral')) {
            const btn = document.createElement('button');
            btn.id = "btnBloqueioGeral";
            btn.innerHTML = "Bloqueios 🚫";
            btn.style = "background:#ef4444; color:white; padding:8px 12px; border-radius:8px; font-weight:900; font-size:10px; text-transform:uppercase; border:none; cursor:pointer; margin-right:8px;";
            btn.onclick = window.abrirPainelBloqueio;
            btnNovo.parentElement.prepend(btn);
        }
    }
    setInterval(injetarBotao, 1000);
})();
/**
 * INTEGRAÇÃO DAS FERRAMENTAS NOS BOTÕES EXISTENTES
 */
(function() {
    // 1. DATABASE UNIFICADO
    window.dbAgendamentos = JSON.parse(localStorage.getItem('nilo_agendamentos')) || [];

    const salvarDB = () => {
        localStorage.setItem('nilo_agendamentos', JSON.stringify(window.dbAgendamentos));
    };

    // 2. LÓGICA DE RENDERIZAÇÃO (Acoplada aos seus botões)
    window.renderPainelAgendamento = function(tipo) {
        const container = document.querySelector('.card-pet')?.parentNode;
        if (!container) return;

        // Ordenação por data/hora
        window.dbAgendamentos.sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

        let filtrados = window.dbAgendamentos;
        if (tipo === 'dia') {
            const hoje = new Date().toISOString().split('T')[0];
            filtrados = window.dbAgendamentos.filter(a => a.data === hoje);
        } else if (tipo === 'pacotes') {
            filtrados = window.dbAgendamentos.filter(a => a.servico.includes('pacote'));
        }

        let html = `
            <div class="bg-white p-4 rounded-2xl border shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-black text-slate-800 uppercase italic">📋 Gestão: ${tipo}</h2>
                    <button onclick="abrirFormAgendamento()" class="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-[10px]">+ ADICIONAR NOVO</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-[11px] border-collapse">
                        <thead>
                            <tr class="bg-slate-100 text-slate-600 uppercase">
                                <th class="p-2 border">Data/Hora</th>
                                <th class="p-2 border">Cliente/Pet</th>
                                <th class="p-2 border">Serviço/Venc.</th>
                                <th class="p-2 border">Financeiro ADM</th>
                                <th class="p-2 border">Pagamento</th>
                                <th class="p-2 border">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtrados.map(a => `
                                <tr class="border-b">
                                    <td class="p-2"><b>${a.data}</b><br>${a.horario}</td>
                                    <td class="p-2"><b>${a.cliente}</b><br>🐾 ${a.pet}</td>
                                    <td class="p-2">
                                        <span class="font-bold uppercase">${a.servico}</span>
                                        ${a.vencimento ? `<br><span class="text-red-500">Venc: ${a.vencimento}</span>` : ''}
                                    </td>
                                    <td class="p-2 bg-slate-50">
                                        Serv: R$ ${a.valor_servico}<br>
                                        Leva/Tras: R$ ${a.taxa_entrega}<br>
                                        <b class="text-blue-700">Total: R$ ${a.total}</b>
                                    </td>
                                    <td class="p-2 font-bold text-green-600 uppercase">${a.forma_pagamento}</td>
                                    <td class="p-2">
                                        <button onclick="abrirFormAgendamento(${a.id})" class="mr-1">✏️</button>
                                        <button onclick="excluirItem(${a.id})" class="text-red-500">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        
        container.innerHTML = html;
    };

    // 3. FORMULÁRIO COM CAMPOS ADM (Tudo editável)
    window.abrirFormAgendamento = function(id = null) {
        const item = id ? window.dbAgendamentos.find(x => x.id === id) : {};
        
        const modal = document.createElement('div');
        modal.style = "position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;";
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto" style="max-height: 90vh;">
                <h3 class="font-black uppercase mb-4 text-slate-800">Editar Agendamento / Pacote</h3>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <input id="f_cliente" placeholder="Cliente" value="${item.cliente || ''}" class="border p-2 rounded font-bold">
                    <input id="f_pet" placeholder="Nome do Pet" value="${item.pet || ''}" class="border p-2 rounded font-bold">
                </div>
                <select id="f_servico" class="w-full border p-2 mb-3 font-bold uppercase">
                    <option value="avulso" ${item.servico === 'avulso' ? 'selected' : ''}>AVULSO</option>
                    <option value="pacote_basico" ${item.servico === 'pacote_basico' ? 'selected' : ''}>PACOTE BÁSICO</option>
                    <option value="pacote_tosa" ${item.servico === 'pacote_tosa' ? 'selected' : ''}>PACOTE COM TOSA</option>
                    <option value="pacote_premium" ${item.servico === 'pacote_premium' ? 'selected' : ''}>PACOTE PREMIUM</option>
                </select>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <input type="date" id="f_data" value="${item.data || ''}" class="border p-2 rounded">
                    <input type="time" id="f_horario" value="${item.horario || ''}" class="border p-2 rounded">
                </div>
                <div class="bg-blue-50 p-3 rounded-lg mb-3">
                    <p class="text-[10px] font-black uppercase mb-2">Financeiro ADM</p>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="number" id="f_valor" placeholder="Valor Serviço" value="${item.valor_servico || ''}" class="border p-2 rounded">
                        <input type="number" id="f_taxa" placeholder="Taxa Leva/Tras" value="${item.taxa_entrega || ''}" class="border p-2 rounded">
                        <input type="number" id="f_desc" placeholder="Desconto" value="${item.desconto || ''}" class="border p-2 rounded">
                        <input type="date" id="f_venc" title="Vencimento Pacote" value="${item.vencimento || ''}" class="border p-2 rounded">
                    </div>
                </div>
                <select id="f_pag" class="w-full border p-2 mb-4 font-bold bg-green-50">
                    <option value="pix">PIX</option>
                    <option value="qrcode_pix">QRCODE PIX</option>
                    <option value="cartao_credito">CARTÃO CRÉDITO</option>
                    <option value="cartao_debito">CARTÃO DÉBITO</option>
                    <option value="dinheiro">DINHEIRO</option>
                </select>
                <div class="flex gap-2">
                    <button id="btnFechar" class="flex-1 bg-slate-200 p-3 rounded-xl font-bold">CANCELAR</button>
                    <button id="btnSalvar" class="flex-1 bg-green-600 text-white p-3 rounded-xl font-bold">SALVAR</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('btnFechar').onclick = () => modal.remove();
        document.getElementById('btnSalvar').onclick = () => {
            const v_serv = parseFloat(document.getElementById('f_valor').value || 0);
            const v_taxa = parseFloat(document.getElementById('f_taxa').value || 0);
            const v_desc = parseFloat(document.getElementById('f_desc').value || 0);
            
            const novoDado = {
                id: id || Date.now(),
                cliente: document.getElementById('f_cliente').value,
                pet: document.getElementById('f_pet').value,
                servico: document.getElementById('f_servico').value,
                data: document.getElementById('f_data').value,
                horario: document.getElementById('f_horario').value,
                valor_servico: v_serv,
                taxa_entrega: v_taxa,
                desconto: v_desc,
                total: (v_serv + v_taxa) - v_desc,
                vencimento: document.getElementById('f_venc').value,
                forma_pagamento: document.getElementById('f_pag').value
            };

            if (id) {
                const idx = window.dbAgendamentos.findIndex(x => x.id === id);
                window.dbAgendamentos[idx] = novoDado;
            } else {
                window.dbAgendamentos.push(novoDado);
            }

            salvarDB();
            modal.remove();
            window.renderPainelAgendamento('geral');
        };
    };

    window.excluirItem = (id) => {
        if(confirm("Excluir?")) {
            window.dbAgendamentos = window.dbAgendamentos.filter(x => x.id !== id);
            salvarDB();
            window.renderPainelAgendamento('geral');
        }
    };

    // 4. ATRIBUIÇÃO AOS BOTÕES EXISTENTES (Mapping)
    function conectarBotoes() {
        const btnGeral = document.querySelector('button:contains("Agendamentos Geral")') || document.querySelector('#btnGeral'); 
        const btnDia = document.querySelector('button:contains("Agendamentos do Dia")') || document.querySelector('#btnDia');
        const btnPacotes = document.querySelector('button:contains("Controle de Pacotes")') || document.querySelector('#btnPacote');

        if(btnGeral) btnGeral.onclick = () => window.renderPainelAgendamento('geral');
        if(btnDia) btnDia.onclick = () => window.renderPainelAgendamento('dia');
        if(btnPacotes) btnPacotes.onclick = () => window.renderPainelAgendamento('pacotes');
    }

    // jQuery-like selector helper para encontrar pelo texto se não houver ID
    if (!window.jQuery) {
        window.addEventListener('load', conectarBotoes);
    }
    setInterval(conectarBotoes, 1000);

})();
