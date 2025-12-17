import { useState } from "react";

function App() {
  const [questionario, setQuestionario] = useState(null);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [idUsuario, setIdUsuario] = useState(null);
  const [idTentativa, setIdTentativa] = useState(null);

  /* ===============================
     INICIAR QUESTIONÁRIO
  ================================ */
  async function iniciarQuestionario() {
    try {
      // Usuário
      const resUsuario = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email })
      });

      const usuario = await resUsuario.json();
      setIdUsuario(usuario.idUsuario);

      // Tentativa
      const resTentativa = await fetch("http://localhost:3001/tentativas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: usuario.idUsuario })
      });

      const tentativa = await resTentativa.json();
      setIdTentativa(tentativa.idTentativa);

      // Questionário
      const resQ = await fetch("http://localhost:3001/questionario");
      const data = await resQ.json();

      setQuestionario(data);
      setIndicePergunta(0);
      setPontuacao(0);
      setFinalizado(false);

      console.log("Tentativa:", tentativa.idTentativa);
    } catch (error) {
      console.error("Erro ao iniciar questionário:", error);
    }
  }

  /* ===============================
     RESPONDER
  ================================ */
  function responder(pontos) {
    setPontuacao((prev) => prev + pontos);

    if (indicePergunta + 1 < questionario.perguntas.length) {
      setIndicePergunta((prev) => prev + 1);
    } else {
      setFinalizado(true);
    }
  }

  /* ===============================
     REINICIAR (MESMO USUÁRIO)
  ================================ */
  async function reiniciar() {
    // nova tentativa
    const resTentativa = await fetch("http://localhost:3001/tentativas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario })
    });

    const tentativa = await resTentativa.json();
    setIdTentativa(tentativa.idTentativa);

    setIndicePergunta(0);
    setPontuacao(0);
    setFinalizado(false);

    console.log("Nova tentativa:", tentativa.idTentativa);
  }

  /* ===============================
     NOVO USUÁRIO
  ================================ */
  function novo() {
    setQuestionario(null);
    setNome("");
    setEmail("");
    setPontuacao(0);
    setIndicePergunta(0);
    setFinalizado(false);
    setIdUsuario(null);
    setIdTentativa(null);
  }

  /* ===============================
     TELAS
  ================================ */
  if (!questionario) {
    return (
      <div>
        <h2>Iniciar Questionário</h2>

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
        <p>Nome: {nome}</p>
        <p>Email: {email}</p>
        <p>Pontuação: {pontuacao}</p>
        <p>ID da tentativa: {idTentativa}</p>

        <button onClick={reiniciar}>Reiniciar</button>
        <button onClick={novo}>Novo</button>
      </div>
    );
  }

  const perguntaAtual = questionario.perguntas[indicePergunta];

  return (
    <div>
      <h3>{perguntaAtual.pergunta}</h3>

      {perguntaAtual.opcoes.map((opcao, index) => (
        <button key={index} onClick={() => responder(opcao.pontos)}>
          {opcao.descricao}
        </button>
      ))}
    </div>
  );
}

export default App;
