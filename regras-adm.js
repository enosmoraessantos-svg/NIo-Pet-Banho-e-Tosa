/**
 * REGRAS ADICIONAIS - NILO PET ADM
 * Este arquivo modifica o comportamento do Login sem alterar o código principal.
 */

(function() {
    // 1. Configurações de Recuperação
    const CONFIG_RECUPERACAO = {
        pergunta: "Qual o nome da primeira mascote da Nilo Pet?",
        respostaCorreta: "nilo", // Altere aqui a resposta secreta
        senhaOriginal: "nilopet2024"
    };

    // Espera o DOM carregar para injetar os elementos
    window.addEventListener('load', () => {
        const loginCard = document.querySelector('#loginArea div');
        const btnEntrar = document.querySelector('#loginArea button');

        if (loginCard && btnEntrar) {
            // 2. Criar e Injetar o Botão "Esqueci a Senha"
            const btnEsqueci = document.createElement('button');
            btnEsqueci.innerText = "ESQUECI A SENHA";
            btnEsqueci.style = "font-size: 10px; color: #94a3b8; font-weight: 800; margin-top: 15px; cursor: pointer; text-transform: uppercase;";
            
            // Adiciona o botão logo após o botão de Entrar
            btnEntrar.parentNode.appendChild(btnEsqueci);

            // 3. Ação do Botão Esqueci a Senha
            btnEsqueci.onclick = () => {
                const respostaUser = prompt(CONFIG_RECUPERACAO.pergunta);
                
                if (respostaUser === null) return; // Cancelou

                if (respostaUser.toLowerCase().trim() === CONFIG_RECUPERACAO.respostaCorreta) {
                    alert("✅ VALIDAÇÃO COM SUCESSO!\nSua senha é: " + CONFIG_RECUPERACAO.senhaOriginal);
                } else {
                    alert("❌ RESPOSTA INCORRETA!\nEntre em contato com o suporte técnico.");
                }
            };
        }
    });

    console.log("✅ Regras Adicionais Carregadas: Recuperação de Senha Injetada.");
    /**
 * REGRAS ADICIONAIS - GESTÃO DE VAGAS AVANÇADA
 * Este código substitui a gestão de vagas original por uma personalizada.
 */

// 1. Substitui a função original do ADM pela nova lógica
window.renderVagas = function(container) {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    // Filtro de dia para visualização
    let html = `
        <div class="card-pet">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black uppercase text-lg italic text-slate-800">⚙️ Configuração de Agenda</h3>
                <button onclick="adicionarNovoHorario()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase">+ Novo Horário</button>
            </div>
            
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">Gerencie as vagas por espécie e porte:</p>
    `;

    // Agrupar por dia da semana para ficar organizado
    [3, 4, 5, 6, 0].forEach(diaNum => {
        const vagasDoDia = todosDados.filter(v => v.dia_semana == diaNum);
        
        html += `
            <div class="mb-8 border-l-4 border-red-600 pl-4">
                <h4 class="font-black text-red-600 uppercase text-sm mb-3">${dias[diaNum]}</h4>
                <div class="grid grid-cols-1 gap-2">
        `;

        vagasDoDia.forEach(v => {
            html += `
                <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-wrap">
                    <span class="font-black text-slate-700 w-16 text-sm">${v.horario}</span>
                    
                    <!-- VAGAS POR PORTE -->
                    <div class="flex gap-2 items-center flex-grow">
                        <div class="flex flex-col items-center">
                            <label class="text-[8px] font-black uppercase text-slate-500">Peq/Med</label>
                            <input type="number" value="${v.vagas_pequeno_medio || 0}" onchange="upVaga(${v.id}, 'vagas_pequeno_medio', this.value)" class="w-10 border rounded p-1 text-center font-bold">
                        </div>
                        <div class="flex flex-col items-center">
                            <label class="text-[8px] font-black uppercase text-slate-500">Grd Curto</label>
                            <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-10 border rounded p-1 text-center font-bold">
                        </div>
                        <div class="flex flex-col items-center">
                            <label class="text-[8px] font-black uppercase text-slate-500">Grd Peludo</label>
                            <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-10 border rounded p-1 text-center font-bold">
                        </div>
                        <div class="flex flex-col items-center border-l pl-2">
                            <label class="text-[8px] font-black uppercase text-blue-600">Gatos</label>
                            <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-10 border rounded p-1 text-center font-bold border-blue-200">
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)" class="w-4 h-4">
                        <label class="text-[9px] font-black uppercase text-red-500">Bloquear</label>
                        <button onclick="removerHorario(${v.id})" class="ml-2 text-slate-300 hover:text-red-600">✕</button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
};

// 2. Função para Adicionar Horário Manualmente
window.adicionarNovoHorario = async function() {
    const dia = prompt("Dia da Semana (0-Dom, 3-Qua, 4-Qui, 5-Sex, 6-Sab):");
    const hora = prompt("Horário (ex: 14:30):");
    
    if (dia && hora) {
        const novo = {
            dia_semana: parseInt(dia),
            horario: hora,
            vagas_pequeno_medio: 4,
            vagas_grande_curto: 1,
            vagas_grande_peludo: 1,
            vagas_gato: 1
        };

        const res = await fetch(`${SB_URL}/configuracoes_agenda`, {
            method: "POST",
            headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
            body: JSON.stringify(novo)
        });

        if(res.ok) carregarDados();
    }
};

// 3. Função para Remover Horário
window.removerHorario = async function(id) {
    if(confirm("Deseja excluir este horário permanentemente?")) {
        await fetch(`${SB_URL}/configuracoes_agenda?id=eq.${id}`, { 
            method: "DELETE", 
            headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY } 
        });
        carregarDados();
    }
};

})();

