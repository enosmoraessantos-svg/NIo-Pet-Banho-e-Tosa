import { useState } from "react";

export default function Admin() {
  const [dados, setDados] = useState([
    {
      nome: "Cliente Teste",
      telefone: "11999999999",
      servico: "Banho",
      data: "10/04",
      hora: "09:00"
    }
  ]);

  function enviarWhatsApp(cliente) {
    const msg = `Olá, tudo bem? 👋

Aqui é do Nilo Pet Banho e Tosa 🐶

📅 Data: ${cliente.data}
⏰ Horário: ${cliente.hora}

🐾 Cliente: ${cliente.nome}
🛁 Serviço: ${cliente.servico}

👉 Qual será a forma de pagamento?`;

    window.open(`https://wa.me/55${cliente.telefone}?text=${encodeURIComponent(msg)}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Painel Administrativo</h1>

      {dados.map((c, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
          <p><b>{c.nome}</b></p>
          <p>Serviço: {c.servico}</p>
          <p>{c.data} - {c.hora}</p>

          <button onClick={() => enviarWhatsApp(c)}>
            Enviar WhatsApp
          </button>
        </div>
      ))}
    </div>
  );
}
