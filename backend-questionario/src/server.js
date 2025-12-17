import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   CONEXÃO COM BANCO
================================ */
const conexao = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql@94",
  database: "questionario",
  port: 3306
});

/* ===============================
   TENTATIVAS EM MEMÓRIA
================================ */
let contadorTentativas = 0;
const tentativas = [];

/* ===============================
   BUSCAR QUESTIONÁRIO
================================ */
app.get("/questionario", async (req, res) => {
  try {
    const [perguntas] = await conexao.execute(
      "SELECT id, descricao FROM perguntas ORDER BY id"
    );

    const [opcoes] = await conexao.execute(
      "SELECT pergunta_id, descricao, pontos FROM opcoes ORDER BY ordem_op"
    );

    const perguntasFormatadas = perguntas.map((p) => ({
      id: p.id,
      pergunta: p.descricao,
      opcoes: opcoes
        .filter((o) => o.pergunta_id === p.id)
        .map((o) => ({
          descricao: o.descricao,
          pontos: o.pontos
        }))
    }));

    res.json({
      id: 1,
      perguntas: perguntasFormatadas
    });
  } catch (error) {
    console.error("Erro ao buscar questionário:", error);
    res.status(500).json({ erro: "Erro ao buscar questionário" });
  }
});

/* ===============================
   CRIAR / BUSCAR USUÁRIO
================================ */
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email } = req.body;

    const [existente] = await conexao.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existente.length > 0) {
      return res.json({ idUsuario: existente[0].id });
    }

    const [resultado] = await conexao.execute(
      "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
      [nome, email]
    );

    res.json({ idUsuario: resultado.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar/buscar usuário" });
  }
});

/* ===============================
   INICIAR / REINICIAR TENTATIVA
================================ */
app.post("/tentativas", (req, res) => {
  contadorTentativas++;

  const { idUsuario } = req.body;

  const tentativa = {
    idTentativa: contadorTentativas,
    idUsuario,
    data: new Date()
  };

  tentativas.push(tentativa);

  res.json({ idTentativa: tentativa.idTentativa });
});

/* ===============================
   SERVER
================================ */
app.listen(3001, () => {
  console.log("Backend rodando em http://localhost:3001");
});
