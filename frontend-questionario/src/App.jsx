import { useState } from "react";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [questionario, setQuestionario] = useState(null);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  async function iniciarQuestionario() {
    try {
      const response = await fetch("http://localhost:3001/iniciar-questionario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email })
      });

      const data = await response.json();
      setQuestionario(data);
      setIndicePergunta(0);
      setPontuacao(0);
      setFinalizado(false);
    } catch (error) {
      console.error("Erro ao iniciar questionário:", error);
    }
  }

  function responderPergunta(pontos) {
    setPontuacao(prev => prev + pontos);

    const proxima = indicePergunta + 1;
    if (proxima < questionario.perguntas.length) {
      setIndicePergunta(proxima);
    } else {
      setFinalizado(true);
    }
  }

  // TELA INICIAL
  if (!questionario) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Questionário</h1>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <br /><br />

        <button onClick={iniciarQuestionario}>
          Começar
        </button>
      </div>
    );
  }

  // TELA FINAL
  if (finalizado) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Questionário finalizado</h2>
        <p>Nome: {questionario.usuario?.nome}</p>
        <p>Email: {questionario.usuario?.email}</p>
        <p>Pontuação: {pontuacao}</p>

        <button onClick={() => setQuestionario(null)}>
          Reiniciar
        </button>
      </div>
    );
  }

  // PERGUNTA ATUAL
  const perguntaAtual = questionario.perguntas[indicePergunta];

  return (
    <div style={{ padding: 20 }}>
      <h2>{perguntaAtual.descricao}</h2>

      {perguntaAtual.opcoes.map((opcao, index) => (
        <button
          key={index}
          onClick={() => responderPergunta(opcao.pontos)}
          style={{ display: "block", margin: "8px 0" }}
        >
          {opcao.descricao}
        </button>
      ))}

      <p>
        Pergunta {indicePergunta + 1} de {questionario.perguntas.length}
      </p>
    </div>
  );
}

export default App;
