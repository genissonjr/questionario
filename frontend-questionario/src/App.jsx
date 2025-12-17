import { useState } from "react";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [usuario, setUsuario] = useState(null);
  const [questionario, setQuestionario] = useState(null);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  async function iniciarQuestionario() {
    try {
      // 1️⃣ Criar ou buscar usuário
      const responseUsuario = await fetch(
        "http://localhost:3001/usuarios",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email })
        }
      );

      if (!responseUsuario.ok) {
        throw new Error("Erro ao salvar/buscar usuário");
      }

      const usuarioData = await responseUsuario.json();
      setUsuario(usuarioData);

      // 2️⃣ Buscar questionário
      const responseQuestionario = await fetch(
        "http://localhost:3001/questionario"
      );

      const questionarioData = await responseQuestionario.json();
      setQuestionario(questionarioData);

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

        <button onClick={iniciarQuestionario}>
          Começar
        </button>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div>
        <h2>Questionário Finalizado</h2>
        <p><strong>Nome:</strong> {usuario.nome}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Pontuação:</strong> {pontuacao}</p>

        <button onClick={() => setQuestionario(null)}>
          Reiniciar
        </button>
      </div>
    );
  }

  const perguntaAtual = questionario.perguntas[indicePergunta];

  return (
    <div>
      <h2>{perguntaAtual.pergunta}</h2>

      {perguntaAtual.opcoes.map((opcao, index) => (
        <button
          key={index}
          onClick={() => responder(opcao.pontos)}
        >
          {opcao.descricao}
        </button>
      ))}
    </div>
  );
}

export default App;
