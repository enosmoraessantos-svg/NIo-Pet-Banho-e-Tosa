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
(function() {
    const renderOriginal = window.renderizar;

    window.renderizar = function() {
        // PRESERVA SEU BOTÃO DE VAGAS ORIGINAL
        if (window.filtroAtual === 'vagas') return renderOriginal();

        const container = document.getElementById('containerCards');
        let filtrados = [...window.todosDados];

        // 1. LÓGICA DE FILTROS E AGRUPAMENTO PARA PACOTES
        if (window.filtroAtual === 'dia') {
            const hoje = new Date().toISOString().split('T')[0];
            filtrados = filtrados.filter(i => i.agenda_data === hoje || JSON.stringify(i).includes(hoje));
        } else if (window.filtroAtual === 'pacotes') {
            // Filtra apenas quem tem plano e agrupa por cliente para ver "quantidade"
            filtrados = filtrados.filter(i => i.plano && i.plano.includes('pacote'));
        }

        // Ordenação Geral por Data/Hora
        filtrados.sort((a, b) => (a.agenda_data + a.agenda_hora).localeCompare(b.agenda_data + b.agenda_hora));

        // 2. CONSTRUÇÃO DA INTERFACE ADM TIPO "PLANILHA" EDITÁVEL
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-slate-200">
                <div class="bg-slate-800 p-4 flex justify-between items-center">
                    <h3 class="text-white font-black uppercase italic text-sm">Painel de Controle: ${window.filtroAtual}</h3>
                    <button onclick="window.novoAgendamentoAdm()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase transition">+ Adicionar Registro</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-[11px] border-collapse">
                        <thead class="bg-slate-100 text-slate-600 uppercase font-black border-b-2 border-slate-200">
                            <tr>
                                <th class="p-3">📅 Data/Hora</th>
                                <th class="p-3">🐾 Cliente & Pet</th>
                                <th class="p-3">📦 Serviço/Pacote</th>
                                <th class="p-3 bg-blue-50">💰 Financeiro ADM</th>
                                <th class="p-3">💳 Pagamento</th>
                                <th class="p-3 text-center">⚙️</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${filtrados.map(item => {
                                const vServ = parseFloat(item.valor_servico || 0);
                                const vTaxa = parseFloat(item.taxa_leva_tras || 0);
                                const total = vServ + vTaxa;
                                return `
                                <tr class="hover:bg-blue-50/50 transition">
                                    <td class="p-3">
                                        <input type="date" value="${item.agenda_data || ''}" onchange="updateDB('${item.id}', 'agenda_data', this.value)" class="font-bold block bg-transparent outline-none mb-1">
                                        <input type="time" value="${item.agenda_hora || ''}" onchange="updateDB('${item.id}', 'agenda_hora', this.value)" class="text-slate-400 font-bold bg-transparent outline-none">
                                    </td>
                                    <td class="p-3">
                                        <input type="text" value="${item.cliente || ''}" onchange="updateDB('${item.id}', 'cliente', this.value)" class="font-black uppercase text-slate-800 w-full bg-transparent outline-none mb-1" placeholder="Cliente">
                                        <input type="text" value="${item.pet_nome || ''}" onchange="updateDB('${item.id}', 'pet_nome', this.value)" class="font-bold text-blue-500 w-full bg-transparent outline-none italic" placeholder="Nome do Pet">
                                    </td>
                                    <td class="p-3">
                                        <select onchange="updateDB('${item.id}', 'plano', this.value)" class="font-black uppercase w-full bg-transparent outline-none mb-1 cursor-pointer">
                                            <option value="avulso" ${item.plano === 'avulso' ? 'selected' : ''}>AVULSO</option>
                                            <option value="pacote_basico" ${item.plano === 'pacote_basico' ? 'selected' : ''}>PACOTE BÁSICO</option>
                                            <option value="pacote_tosa" ${item.plano === 'pacote_tosa' ? 'selected' : ''}>PACOTE C/ TOSA</option>
                                            <option value="pacote_premium" ${item.plano === 'pacote_premium' ? 'selected' : ''}>PACOTE PREMIUM</option>
                                        </select>
                                        <div class="flex items-center gap-1 text-[9px] font-black text-purple-600">
                                            <span>VENC:</span>
                                            <input type="date" value="${item.vencimento_pacote || ''}" onchange="updateDB('${item.id}', 'vencimento_pacote', this.value)" class="bg-transparent outline-none">
                                        </div>
                                    </td>
                                    <td class="p-3 bg-blue-50/50">
                                        <div class="space-y-1">
                                            <div class="flex justify-between"><span>Valor:</span> <input type="number" value="${vServ}" onchange="updateDB('${item.id}', 'valor_servico', this.value)" class="w-14 text-right font-bold bg-transparent border-b border-blue-200"></div>
                                            <div class="flex justify-between"><span>Taxa L/T:</span> <input type="number" value="${vTaxa}" onchange="updateDB('${item.id}', 'taxa_leva_tras', this.value)" class="w-14 text-right font-bold bg-transparent border-b border-blue-200"></div>
                                            <div class="flex justify-between text-blue-700 font-black pt-1"><span>TOTAL:</span> <span>R$ ${total.toFixed(2)}</span></div>
                                            <div class="flex justify-between text-red-500 font-black"><span>COM DESC:</span> <input type="number" value="${item.total_com_desconto || 0}" onchange="updateDB('${item.id}', 'total_com_desconto', this.value)" class="w-14 text-right bg-transparent border-b border-red-200"></div>
                                        </div>
                                    </td>
                                    <td class="p-3">
                                        <select onchange="updateDB('${item.id}', 'forma_pagamento', this.value)" class="font-black text-green-600 uppercase bg-transparent outline-none w-full cursor-pointer">
                                            <option value="pix" ${item.forma_pagamento === 'pix' ? 'selected' : ''}>PIX</option>
                                            <option value="qrcode_pix" ${item.forma_pagamento === 'qrcode_pix' ? 'selected' : ''}>QR CODE PIX</option>
                                            <option value="cartao_credito" ${item.forma_pagamento === 'cartao_credito' ? 'selected' : ''}>CRÉDITO</option>
                                            <option value="cartao_debito" ${item.forma_pagamento === 'cartao_debito' ? 'selected' : ''}>DÉBITO</option>
                                            <option value="dinheiro" ${item.forma_pagamento === 'dinheiro' ? 'selected' : ''}>DINHEIRO</option>
                                        </select>
                                    </td>
                                    <td class="p-3 text-center">
                                        <button onclick="window.excluirRegistroAdm('${item.id}')" class="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white w-8 h-8 rounded-full transition flex items-center justify-center mx-auto">✕</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // 3. FUNÇÕES DE SUPORTE
    window.novoAgendamentoAdm = async function() {
        const nome = prompt("Nome do Cliente:");
        if (!nome) return;
        const novo = { 
            cliente: nome, 
            pet_nome: "Nome do Pet", 
            plano: "avulso", 
            agenda_data: new Date().toISOString().split('T')[0],
            forma_pagamento: 'pix',
            valor_servico: 0,
            taxa_leva_tras: 0
        };
        await fetch(`${SB_URL}/agendamentos`, { method: "POST", headers: { ...headers, "Prefer": "return=minimal" }, body: JSON.stringify(novo) });
        carregarDados();
    };

    window.excluirRegistroAdm = async function(id) {
        if (!confirm("Excluir este agendamento permanentemente?")) return;
        await fetch(`${SB_URL}/agendamentos?id=eq.${id}`, { method: "DELETE", headers });
        carregarDados();
    };

})();
