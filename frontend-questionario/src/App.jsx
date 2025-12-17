import { useState } from "react";

function App() {
  const [questionario, setQuestionario] = useState(null);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [idTentativa, setIdTentativa] = useState(null);

  async function iniciarQuestionario() {
    try {
      // Buscar questionário
      const response = await fetch("http://localhost:3001/questionario");
      const data = await response.json();

      // Criar tentativa
      const responseTentativa = await fetch(
        "http://localhost:3001/questionario/iniciar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionarioId: data.id,
            nome,
            email
          })
        }
      );

      const tentativa = await responseTentativa.json();

      setQuestionario(data);
      setIdTentativa(tentativa.idTentativa);

      console.log({
        idQuestionario: data.id,
        idTentativa: tentativa.idTentativa
      });

      setIndicePergunta(0);
      setPontuacao(0);
      setFinalizado(false);
    } catch (error) {
      console.error("Erro ao iniciar questionário:", error);
    }
  }

  function responder(pontos) {
    setPontuacao((prev) => prev + pontos);

    if (indicePergunta + 1 < questionario.perguntas.length) {
      setIndicePergunta((prev) => prev + 1);
    } else {
      setFinalizado(true);
    }
  }

  if (!questionario) {
    return (
      <div>
        <h1>Iniciar Questionário</h1>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={iniciarQuestionario}>Começar</button>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div>
        <h2>Finalizado</h2>
        <p>Pontuação: {pontuacao}</p>
        <p>ID da tentativa: {idTentativa}</p>

        <button onClick={iniciarQuestionario}>Reiniciar</button>
      </div>
    );
  }

  if (!questionario.perguntas || questionario.perguntas.length === 0) {
  return <p>Questionário sem perguntas.</p>;
}

const perguntaAtual = questionario.perguntas[indicePergunta];


  return (
    <div>
      <h2>{perguntaAtual.pergunta}</h2>

      {perguntaAtual.opcoes.map((opcao, index) => (
        <button key={index} onClick={() => responder(opcao.pontos)}>
          {opcao.descricao}
        </button>
      ))}
    </div>
  );
}

export default App;

