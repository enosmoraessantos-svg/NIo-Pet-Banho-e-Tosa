// adm-adicional.js - SISTEMA DE GESTÃO INTEGRADA NILO PET

// --- 1. CONFIGURAÇÃO DE VAGAS E DIAS (CARREGA DO BANCO) ---
async function carregarConfigVagas() {
    const res = await fetch(`${SB_URL}/config_vagas?select=*`, { headers });
    const dados = await res.json();
    return dados;
}

// --- 2. RENDERIZAÇÃO DA GESTÃO DE VAGAS (PAINEL ADM) ---
function renderVagasSet(container) {
    container.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
            <h3 class="font-black text-slate-800 mb-4 uppercase italic">Gestão de Vagas por Porte</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- CACHORRO P/M -->
                <div class="space-y-2">
                    <p class="font-bold text-red-600 border-b">PEQUENO / MÉDIO</p>
                    <div class="flex justify-between">Banho: <input type="number" onchange="salvarVaga('pm_banho', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Tosa: <input type="number" onchange="salvarVaga('pm_tosa', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Higi: <input type="number" onchange="salvarVaga('pm_higi', this.value)" class="w-16"></div>
                </div>

                <!-- GRANDE PELUDO -->
                <div class="space-y-2">
                    <p class="font-bold text-red-600 border-b">GRANDE PELUDO</p>
                    <div class="flex justify-between">Banho: <input type="number" onchange="salvarVaga('gp_banho', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Tosa: <input type="number" onchange="salvarVaga('gp_tosa', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Higi: <input type="number" onchange="salvarVaga('gp_higi', this.value)" class="w-16"></div>
                </div>

                <!-- GRANDE PELO CURTO -->
                <div class="space-y-2">
                    <p class="font-bold text-red-600 border-b">GRANDE PELO CURTO</p>
                    <div class="flex justify-between">Banho: <input type="number" onchange="salvarVaga('gc_banho', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Tosa: <input type="number" onchange="salvarVaga('gc_tosa', this.value)" class="w-16"></div>
                    <div class="flex justify-between">Banho+Higi: <input type="number" onchange="salvarVaga('gc_higi', this.value)" class="w-16"></div>
                </div>

                <!-- GATO -->
                <div class="space-y-2">
                    <p class="font-bold text-red-600 border-b">GATO</p>
                    <div class="flex justify-between">Banho: <input type="number" onchange="salvarVaga('gato_banho', this.value)" class="w-16"></div>
                </div>
            </div>

            <div class="mt-8 border-t pt-4">
                <h4 class="font-bold mb-2">CONTROLE DE AGENDA</h4>
                <button onclick="liberarAgendaMesSeguinte()" class="bg-blue-600 text-white p-2 rounded text-xs font-black">LIBERAR MÊS SEGUINTE (DIA 20)</button>
            </div>
        </div>
    `;
}

// --- 3. LÓGICA DE WHATSAPP (COBRANÇA E RENOVAÇÃO) ---
function zapCobrancaPacote(item) {
    const texto = `Olá ${item.cliente}, informamos que o pacote do seu pet ${item.pet} deve ser pago dia 20 de cada mês.\n\nDados:\nData: 20/${new Date().getMonth()+1}\nValor: R$ ${item.valor_pacote}`;
    window.open(`https://wa.me{item.whatsapp}?text=${encodeURIComponent(texto)}`);
}

function zapRenovacaoPacote(item) {
    const texto = `Caro cliente ${item.cliente}, informamos que o pacote do seu pet ${item.pet} encerrou. Para renovar, acesse nosso link de agendamento.`;
    window.open(`https://wa.me{item.whatsapp}?text=${encodeURIComponent(texto)}`);
}

function zapAgendado(item) {
    const texto = `Olá ${item.cliente}, segue os dados do seu agendamento:\nPet: ${item.pet}\nServiço: ${item.tipo_servico}\nData: ${item.data}\nValor: R$ ${item.valor_real_pago || item.valor_servico}`;
    window.open(`https://wa.me{item.whatsapp}?text=${encodeURIComponent(texto)}`);
}

// --- 4. BLOQUEIO DE HORÁRIOS / PERÍODOS ---
async function salvarBloqueio(dados) {
    // dados: { inicio, fim, motivo, tipo }
    await fetch(`${SB_URL}/bloqueios`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dados)
    });
    alert("Bloqueio salvo com sucesso e definitivo.");
}

async function desbloquear(id) {
    await fetch(`${SB_URL}/bloqueios?id=eq.${id}`, { method: 'DELETE', headers });
    alert("Período desbloqueado.");
}

// --- 5. EXPORTAÇÃO EXCEL (CSV) ---
function exportarRelatorioFull(tipo) {
    let filtrados = [...todosDados];
    const hoje = new Date().toISOString().split('T')[0];

    if(tipo === 'dia') filtrados = todosDados.filter(i => i.data === hoje);
    
    let csv = "\ufeffData;Cliente;Pet;Serviço;Valor;Forma Pagto;Falou Cliente\n";
    filtrados.forEach(i => {
        csv += `${i.data};${i.cliente};${i.pet};${i.tipo_servico};${i.valor_real_pago || i.valor_servico};${i.forma_pagamento};${i.falou_cliente}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_NiloPet_${tipo}.csv`;
    link.click();
}

// --- 6. INTEGRAÇÃO AUTOMÁTICA ---
// Esta função garante que alterações em uma aba reflitam em todas
async function sincronizarTudo() {
    await carregarDados(); // Função do ADM principal
    console.log("Dados sincronizados em todas as áreas.");
}

console.log("Lógica adm-adicional.js carregada com sucesso.");
