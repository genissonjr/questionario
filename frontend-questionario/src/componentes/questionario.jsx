import { useState } from "react";

export default function Questionario({ questionario }) {
  const [perguntaIndex, setPerguntaIndex] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [pontuacao, setPontuacao] = useState(null);

  const perguntaAtual = questionario.perguntas[perguntaIndex];

  function selecionarResposta(opcao) {
    const novasRespostas = [
      ...respostas,
      { perguntaId: perguntaAtual.id, resposta: opcao, correta: perguntaAtual.correta }
    ];
    setRespostas(novasRespostas);

    if (perguntaIndex + 1 < questionario.perguntas.length) {
      setPerguntaIndex(perguntaIndex + 1);
    } else {
      // Calcular pontuação
      const totalCorretas = novasRespostas.filter(r => r.resposta === r.correta).length;
      setPontuacao(totalCorretas);
    }
  }

  // Exibir pontuação se finalizado
  if (pontuacao !== null) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Questionário finalizado!</h2>
        <p>Você acertou {pontuacao} de {questionario.perguntas.length} perguntas.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>{questionario.titulo}</h2>
      <p>{perguntaAtual.texto}</p>

      {perguntaAtual.opcoes.map((opcao, i) => (
        <button
          key={i}
          style={{ display: "block", margin: "10px 0" }}
          onClick={() => selecionarResposta(opcao)}
        >
          {opcao}
        </button>
      ))}
    </div>
  );
}
