import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   CONEXÃO COM O BANCO
================================ */
const conexao = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql@94",
  database: "questionario",
  port: 3306
});

/* ===============================
   CONTROLE DE TENTATIVAS (MEMÓRIA)
================================ */
let contadorTentativas = 0;
const tentativas = [];

/* ===============================
   GET QUESTIONÁRIO
   (perguntas + opções)
================================ */
app.get("/questionario", async (req, res) => {
  try {
    // 🔹 Buscar perguntas
    const [perguntas] = await conexao.execute(
      "SELECT id, descricao FROM perguntas ORDER BY id"
    );

    if (perguntas.length === 0) {
      return res.status(404).json({ erro: "Nenhuma pergunta encontrada" });
    }

    // 🔹 Buscar opções
    const [opcoes] = await conexao.execute(
      "SELECT pergunta_id, descricao, pontos FROM opcoes ORDER BY ordem_op"
    );

    // 🔹 Montar estrutura esperada pelo React
    const perguntasFormatadas = perguntas.map((p) => ({
      id: p.id,
      pergunta: p.descricao, // 👈 aqui está o ajuste correto
      opcoes: opcoes
        .filter((o) => o.pergunta_id === p.id)
        .map((o) => ({
          descricao: o.descricao,
          pontos: o.pontos
        }))
    }));

    const questionario = {
      id: 1, // id lógico do questionário
      titulo: "Questionário",
      usuario: {
        nome: "",
        email: ""
      },
      perguntas: perguntasFormatadas
    };

    res.json(questionario);
  } catch (error) {
    console.error("Erro ao buscar questionário:", error);
    res.status(500).json({ erro: "Erro ao buscar questionário" });
  }
});

/* ===============================
   POST INICIAR TENTATIVA
   (sem banco)
================================ */
app.post("/questionario/iniciar", (req, res) => {
  try {
    contadorTentativas++;

    const { nome, email } = req.body;

    const tentativa = {
      idTentativa: contadorTentativas,
      nome,
      email,
      dataInicio: new Date()
    };

    tentativas.push(tentativa);

    res.status(201).json({
      idTentativa: tentativa.idTentativa
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao iniciar tentativa" });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(3001, () => {
  console.log("Backend rodando em http://localhost:3001");
});
