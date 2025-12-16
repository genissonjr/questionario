import { useState } from "react";
import axios from "axios";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [questionario, setQuestionario] = useState(null);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [carregando, setCarregando] = useState(false); // Adicionei um estado de loading

  async function iniciarQuestionario() {
    if (!nome.trim() || !email.trim()) {
      alert("Por favor, preencha nome e email!");
      return;
    }

    setCarregando(true);
    
    try {
      const response = await axios.post(
        "http://localhost:3001/iniciar-questionario",
        { nome, email }
      );

      setQuestionario(response.data);
      setIndicePergunta(0);
      setPontuacao(0);
      setFinalizado(false);
    } catch (error) {
      console.error("Erro detalhado:", error);
      
      if (error.response) {
        // Servidor respondeu com erro
        alert(`Erro ${error.response.status}: ${error.response.data?.message || "Erro no servidor"}`);
      } else if (error.request) {
        // Requisição feita mas sem resposta
        alert("Servidor não respondeu. Verifique se o backend está rodando na porta 3001.");
      } else {
        // Erro na configuração
        alert(`Erro: ${error.message}`);
      }
    } finally {
      setCarregando(false);
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
          style={{ padding: 8, margin: 5, width: 200 }}
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: 8, margin: 5, width: 200 }}
        />

        <br /><br />

        <button 
          onClick={iniciarQuestionario}
          disabled={carregando}
          style={{ padding: 10, width: 100 }}
        >
          {carregando ? "Carregando..." : "Começar"}
        </button>
        
        {carregando && <p>Aguarde, iniciando questionário...</p>}
      </div>
    );
  }

  // TELA DO QUESTIONÁRIO (adicione esta parte se ainda não tem)
  if (finalizado) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Questionário Finalizado!</h1>
        <h2>Pontuação total: {pontuacao}</h2>
        <button onClick={() => setQuestionario(null)}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const perguntaAtual = questionario.perguntas[indicePergunta];
  
  return (
    <div style={{ padding: 20 }}>
      <h1>{questionario.titulo || "Questionário"}</h1>
      <h3>Pergunta {indicePergunta + 1} de {questionario.perguntas.length}</h3>
      
      <h2>{perguntaAtual.texto}</h2>
      
      <div>
        {perguntaAtual.opcoes.map((opcao, index) => (
          <button
            key={index}
            onClick={() => responderPergunta(opcao.pontos)}
            style={{ 
              display: 'block', 
              margin: '10px 0', 
              padding: 10,
              width: 300 
            }}
          >
            {opcao.texto}
          </button>
        ))}
      </div>
      
      <p>Pontuação atual: {pontuacao}</p>
    </div>
  );
}

export default App; // Certifique-se que tem esta linha