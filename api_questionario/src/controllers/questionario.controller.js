import { pool } from "../db/conexao.js";

export async function iniciarQuestionario(req, res) {
  const { nome, email } = req.body;

  try {
    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    let usuarioId;

    if (usuarios.length === 0) {
      const [resultado] = await pool.query(
        "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
        [nome, email]
      );
      usuarioId = resultado.insertId;
    } else {
      usuarioId = usuarios[0].id;
    }

    const [questionario] = await pool.query(
      "INSERT INTO questionarios (usuario_id) VALUES (?)",
      [usuarioId]
    );

    res.status(201).json({
      questionario_id: questionario.insertId,
      usuario_id: usuarioId
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function listarPerguntas(req, res) {
  try {
    const [perguntas] = await pool.query(
      "SELECT id, descricao FROM perguntas ORDER BY ordem"
    );

    const resultado = [];

    for (const pergunta of perguntas) {
      const [opcoes] = await pool.query(
        `SELECT id, descricao
         FROM opcoes
         WHERE pergunta_id = ?
         ORDER BY ordem_op`,
        [pergunta.id]
      );

      resultado.push({
        id: pergunta.id,
        descricao: pergunta.descricao,
        opcoes
      });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function finalizarQuestionario(req, res) {
  const { questionario_id, opcoes } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ inserir respostas
    for (const opcao_id of opcoes) {
      await conn.query(
        "INSERT INTO respostas (questionario_id, opcao_id) VALUES (?, ?)",
        [questionario_id, opcao_id]
      );
    }

    // 2️⃣ calcular e salvar pontuação
    await conn.query(
      `UPDATE questionarios
       SET dh_termino = NOW(),
           pontuacao = (
             SELECT SUM(o.pontos)
             FROM respostas r
             JOIN opcoes o ON o.id = r.opcao_id
             WHERE r.questionario_id = ?
           )
       WHERE id = ?`,
      [questionario_id, questionario_id]
    );

    await conn.commit();

    res.json({
      mensagem: "Questionário finalizado com sucesso",
      questionario_id
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ erro: error.message });
  } finally {
    conn.release();
  }
}
