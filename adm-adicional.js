// adm-adicional.js - INTEGRADO E CORRIGIDO

// 1. CONFIGURAÇÕES INICIAIS (Verifique se as variáveis abaixo batem com o adm.html)
const SB_URL = "https://supabase.co";
const SB_KEY = "sb_publishable_6SmMDIymguOi59WrVb1QQA_wSykUdUm";
const headers = { 
    "apikey": SB_KEY, 
    "Authorization": "Bearer " + SB_KEY, 
    "Content-Type": "application/json" 
};

// 2. FUNÇÃO DE LOGIN (Garantindo que o botão ENTRAR funcione)
function logar() {
    const userField = document.getElementById('userAdm');
    const passField = document.getElementById('senhaAdm');

    if (!userField || !passField) {
        console.error("Campos de login não encontrados no HTML!");
        return;
    }

    const usuario = userField.value.toLowerCase().trim();
    const senha = passField.value.trim();

    // Regra da sua senha: nilopet2026
    if (usuario === 'nilo pet' && senha === 'nilopet2026') {
        document.getElementById('loginArea').classList.add('hidden');
        document.getElementById('painelArea').classList.remove('hidden');
        carregarDados(); // Chama a função do script principal
    } else {
        alert("Usuário ou Senha incorretos!");
    }
}

// 3. GESTÃO DE VAGAS (Porte e Espécie)
async function salvarVaga(categoria, valor) {
    await fetch(`${SB_URL}/config_vagas?categoria=eq.${categoria}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ quantidade_max: parseInt(valor) })
    });
    console.log(`Vaga ${categoria} atualizada!`);
}

// 4. LÓGICA DE WHATSAPP (Cobrança, Renovação e Agendamento)
const ZapConfig = {
    enviar: (tel, msg) => window.open(`https://wa.me{tel}?text=${encodeURIComponent(msg)}`),
    
    cobranca: (i) => ZapConfig.enviar(i.whatsapp, `Olá ${i.cliente}, o pacote do pet ${i.pet} deve ser pago dia 20. Valor: R$ ${i.valor_pacote}`),
    
    renovacao: (i) => ZapConfig.enviar(i.whatsapp, `Olá ${i.cliente}, o pacote do pet ${i.pet} encerrou. Renove pelo link oficial!`),
    
    lembrete: (i) => ZapConfig.enviar(i.whatsapp, `Olá ${i.cliente}, confirmamos seu agendamento: ${i.pet} dia ${i.data} às ${i.hora}.`)
};

// 5. BLOQUEIOS DEFINITIVOS
async function salvarBloqueioAdm(inicio, fim, motivo, tipo) {
    const corpo = { data_inicio: inicio, data_fim: fim, motivo: motivo, tipo: tipo };
    await fetch(`${SB_URL}/bloqueios`, { method: 'POST', headers, body: JSON.stringify(corpo) });
    alert("Bloqueio salvo com sucesso!");
}

// 6. EXPORTAR EXCEL
function exportarRelatorio(tipo) {
    let csv = "\ufeffData;Cliente;Pet;Serviço;Valor;Status\n";
    todosDados.forEach(i => {
        csv += `${i.data};${i.cliente};${i.pet};${i.tipo_servico};${i.valor_real_pago};${i.falou_cliente}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_${tipo}.csv`;
    link.click();
}

console.log("ADM Adicional Carregado e Botão Entrar Pronto.");

