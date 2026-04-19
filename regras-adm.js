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
})();

