console.log("SERVER CERTO CARREGADO");

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "mysql@94",
  database: "questionario"
};

app.post("/iniciar-questionario", async (req, res) => {
  try {
    const { nome = null, email = null } = req.body || {};
    console.log("Usuário:", nome, email);

    const conexao = await mysql.createConnection(dbConfig);

    const [perguntas] = await conexao.execute(
      "SELECT id, descricao FROM perguntas ORDER BY ordem"
    );

    const questionario = {
      id: 1,
      titulo: "Questionário",
      usuario: { nome, email },
      perguntas: []
    };

    for (const pergunta of perguntas) {
      const [opcoes] = await conexao.execute(
        "SELECT descricao, pontos FROM opcoes WHERE pergunta_id = ? ORDER BY ordem_op",
        [pergunta.id]
      );

      questionario.perguntas.push({
        id: pergunta.id,
        descricao: pergunta.descricao,
        opcoes
      });
    }

    await conexao.end();
    res.json(questionario);
  } catch (err) {
    console.error("ERRO NO BACKEND:", err);
    res.status(500).json({ erro: "Erro ao buscar questionário" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
