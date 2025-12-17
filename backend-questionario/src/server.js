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

/* ===============================
   ROTA: CRIAR / BUSCAR USUÁRIO
================================ */
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e email obrigatórios" });
    }

    // Verificar se email já existe
    const [usuarios] = await conexao.execute(
      "SELECT id, nome, email FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length > 0) {
      return res.json(usuarios[0]); // usuário já existe
    }

    // Criar novo usuário
    const [resultado] = await conexao.execute(
      "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
      [nome, email]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      email
    });
  } catch (error) {
    console.error("Erro ao salvar/buscar usuário:", error);
    res.status(500).json({ erro: "Erro ao salvar/buscar usuário" });
  }
});

/* ===============================
   ROTA: BUSCAR QUESTIONÁRIO
================================ */
app.get("/questionario", async (req, res) => {
  try {
    const [perguntas] = await conexao.execute(
      "SELECT id, descricao FROM perguntas ORDER BY id"
    );

    const [opcoes] = await conexao.execute(
      `SELECT id, descricao, pontos, pergunta_id
       FROM opcoes
       ORDER BY pergunta_id, ordem_op`
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
      titulo: "Questionário",
      perguntas: perguntasFormatadas
    });
  } catch (error) {
    console.error("Erro ao buscar questionário:", error);
    res.status(500).json({ erro: "Erro ao buscar questionário" });
  }
});

/* ===============================
   ROTA: INICIAR TENTATIVA
================================ */
app.post("/questionario/iniciar", (req, res) => {
  contadorTentativas++;

  res.json({
    idTentativa: contadorTentativas
  });
});

/* ===============================
   SERVER
================================ */
app.listen(3001, () => {
  console.log("Backend rodando em http://localhost:3001");
});
