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
 * MÓDULO 2: GESTÃO DE VAGAS (AGENDA)
 */
window.renderVagas = function(container) {
    if (!container) return;

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
        // Filtra os dados globais. Certifique-se que 'todosDados' existe no seu script principal.
        const itens = (typeof todosDados !== 'undefined') ? todosDados.filter(v => v.dia_semana == i) : [];
        
        html += `<div class="mb-8 border-l-4 ${itens.length ? 'border-red-600' : 'border-slate-200'} pl-4">
            <h4 class="font-black ${itens.length ? 'text-red-600' : 'text-slate-400'} uppercase text-sm mb-3">${dias[i]}</h4>`;
        
        itens.forEach(v => {
            html += `
            <div class="bg-white p-4 rounded-xl border mb-3 shadow-sm text-black">
                <div class="flex justify-between border-b pb-2 mb-3">
                    <span class="font-black text-lg">${v.horario}</span>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" ${v.bloqueado ? 'checked' : ''} onchange="upVaga(${v.id}, 'bloqueado', this.checked)">
                        <label class="text-[9px] font-bold uppercase text-red-500">Bloquear</label>
                        <button onclick="removerHorario(${v.id})" class="ml-2 text-slate-300">✕</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-[8px] font-black uppercase text-slate-400">Porte / Espécie</p>
                        <label class="text-[7px] font-bold block">PEQ/MED</label>
                        <input type="number" value="${v.vagas_pequeno_medio || 0}" onchange="upVaga(${v.id}, 'vagas_pequeno_medio', this.value)" class="w-full border rounded text-center focus:bg-yellow-50">
                        <label class="text-[7px] font-bold block">GATO</label>
                        <input type="number" value="${v.vagas_gato || 0}" onchange="upVaga(${v.id}, 'vagas_gato', this.value)" class="w-full border rounded text-center border-blue-200 focus:bg-yellow-50">
                    </div>
                    <div>
                        <p class="text-[8px] font-black uppercase text-slate-400">Grandes</p>
                        <label class="text-[7px] font-bold block">GRD CURTO</label>
                        <input type="number" value="${v.vagas_grande_curto || 0}" onchange="upVaga(${v.id}, 'vagas_grande_curto', this.value)" class="w-full border rounded text-center focus:bg-yellow-50">
                        <label class="text-[7px] font-bold block">GRD PELUDO</label>
                        <input type="number" value="${v.vagas_grande_peludo || 0}" onchange="upVaga(${v.id}, 'vagas_grande_peludo', this.value)" class="w-full border rounded text-center focus:bg-yellow-50">
                    </div>
                    <div class="border-l pl-2">
                        <p class="text-[8px] font-black uppercase text-red-600">Serviços</p>
                        <label class="text-[7px] font-bold block">BANHO / TOSA HIGIÊNICA</label>
                        <input type="number" value="${v.vagas_tosa_higi || 0}" onchange="upVaga(${v.id}, 'vagas_tosa_higi', this.value)" class="w-full border rounded text-center border-red-100 mb-1 focus:bg-yellow-50">
                        <label class="text-[7px] font-bold block">SOMENTE BANHO</label>
                        <input type="number" value="${v.vagas_banho || 0}" onchange="upVaga(${v.id}, 'vagas_banho', this.value)" class="w-full border rounded text-center border-red-100 mb-1 focus:bg-yellow-50">
                        <label class="text-[7px] font-bold block">BANHO + TOSA</label>
                        <input type="number" value="${v.vagas_tosa || 0}" onchange="upVaga(${v.id}, 'vagas_tosa', this.value)" class="w-full border rounded text-center border-red-200 focus:bg-yellow-50">
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html + `</div>`;
};
