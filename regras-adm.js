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
function renderizar() {
    const container = document.getElementById('containerCards');
    if(filtroAtual === 'vagas') return renderVagas(container);

    const hoje = new Date().toISOString().split('T')[0];
    let filtrados = [...todosDados];

    // Regras de Filtro para os 3 Botões
    if(filtroAtual === 'dia') {
        filtrados = todosDados.filter(i => i.data === hoje);
    } else if (filtroAtual === 'pacotes') {
        filtrados = todosDados.filter(i => i.tipo_servico && i.tipo_servico !== 'avulso');
        // Agrupa por cliente (ordem alfabética)
        filtrados.sort((a, b) => a.cliente.localeCompare(b.cliente));
    } else {
        // Geral: Ordem por data (mais recentes primeiro)
        filtrados.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    container.innerHTML = filtrados.map(item => {
        const vServico = parseFloat(item.valor_servico) || 0;
        const vTaxa = parseFloat(item.taxa_leva_tras) || 0;
        const vTotal = vServico + vTaxa;
        const ehPacote = item.tipo_servico && item.tipo_servico !== 'avulso';

        return `
        <div class="card-pet shadow-sm border-l-4 ${ehPacote ? 'border-purple-600' : 'border-red-600'}">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <!-- Informações do Cliente (Tudo Editável) -->
                <div class="flex flex-col gap-1">
                    <input type="text" value="${item.cliente || ''}" onchange="updateDB('${item.id}', 'cliente', this.value)" class="input-edit font-black text-lg text-slate-800 uppercase italic">
                    <input type="text" value="${item.whatsapp || ''}" onchange="updateDB('${item.id}', 'whatsapp', this.value)" class="input-edit text-[10px] font-bold text-slate-500" placeholder="WHATSAPP">
                    <input type="text" value="${item.rua || ''}" onchange="updateDB('${item.id}', 'rua', this.value)" class="input-edit text-[10px] font-bold text-slate-500 uppercase" placeholder="ENDEREÇO">
                    <input type="text" value="${item.pet_nome || ''}" onchange="updateDB('${item.id}', 'pet_nome', this.value)" class="input-edit text-xs font-bold text-red-600" placeholder="NOME DO PET">
                </div>

                <!-- Serviço e Campos de Pacote -->
                <div class="flex flex-col gap-1">
                    <input type="date" value="${item.data || ''}" onchange="updateDB('${item.id}', 'data', this.value)" class="input-edit text-xs font-bold">
                    <select onchange="updateDB('${item.id}', 'tipo_servico', this.value)" class="input-edit text-[10px] font-black uppercase italic">
                        <option value="avulso" ${item.tipo_servico === 'avulso' ? 'selected' : ''}>Avulso</option>
                        <option value="pacote_basico" ${item.tipo_servico === 'pacote_basico' ? 'selected' : ''}>Pacote Básico</option>
                        <option value="pacote_tosa" ${item.tipo_servico === 'pacote_tosa' ? 'selected' : ''}>Básico com Tosa</option>
                        <option value="pacote_premium" ${item.tipo_servico === 'pacote_premium' ? 'selected' : ''}>Pacote Premium</option>
                    </select>

                    ${ehPacote ? `
                        <div class="mt-2 p-2 bg-purple-50 rounded border border-purple-100">
                            <label class="text-[7px] font-black uppercase text-purple-600">Vencimento / Valor Pago</label>
                            <input type="date" value="${item.vencimento_pacote || ''}" onchange="updateDB('${item.id}', 'vencimento_pacote', this.value)" class="bg-transparent text-[10px] w-full">
                            <input type="number" placeholder="VALOR REAL PAGO" value="${item.valor_real_pago || 0}" onchange="updateDB('${item.id}', 'valor_real_pago', this.value)" class="bg-transparent text-[10px] font-black w-full mt-1">
                        </div>
                    ` : ''}
                </div>

                <!-- Financeiro ADM -->
                <div class="bg-slate-50 p-2 rounded">
                    <div class="grid grid-cols-2 gap-1 text-[9px] font-black uppercase">
                        <span>Leva/Trás:</span>
                        <input type="number" value="${vTaxa}" onchange="updateDB('${item.id}', 'taxa_leva_tras', this.value)" class="bg-white px-1 border rounded">
                        
                        <span>Valor Serv:</span>
                        <input type="number" value="${vServico}" onchange="updateDB('${item.id}', 'valor_servico', this.value)" class="bg-white px-1 border rounded">
                        
                        <span class="text-red-600 mt-1">Total:</span>
                        <span class="mt-1">R$ ${vTotal.toFixed(2)}</span>

                        <span class="text-blue-600 italic">C/ Desconto:</span>
                        <input type="number" value="${item.total_com_desconto || 0}" onchange="updateDB('${item.id}', 'total_com_desconto', this.value)" class="bg-white px-1 border rounded">
                    </div>

                    <select onchange="updateDB('${item.id}', 'forma_pagamento', this.value)" class="w-full text-[9px] font-black uppercase mt-2 p-1 border rounded bg-white">
                        <option value="">Forma de Pagamento</option>
                        <option value="pix" ${item.forma_pagamento === 'pix' ? 'selected' : ''}>PIX</option>
                        <option value="credito" ${item.forma_pagamento === 'credito' ? 'selected' : ''}>Cartão de Crédito</option>
                        <option value="debito" ${item.forma_pagamento === 'debito' ? 'selected' : ''}>Cartão de Débito</option>
                        <option value="dinheiro" ${item.forma_pagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
                        <option value="qrcode" ${item.forma_pagamento === 'qrcode' ? 'selected' : ''}>QR Code PIX</option>
                    </select>

                    <button onclick="deleteItem('${item.id}')" class="w-full mt-2 bg-red-100 text-red-600 text-[8px] font-black p-1 rounded hover:bg-red-200 uppercase">Excluir</button>
                </div>
            </div>
        </div>`).join('');
}

// Função para suportar o botão excluir dentro do card
async function deleteItem(id) {
    if(confirm("Deseja excluir este agendamento?")) {
        await fetch(`${SB_URL}/agendamentos?id=eq.${id}`, { method: "DELETE", headers });
        carregarDados();
    }
}
