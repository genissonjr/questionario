import express from "express";
import cors from "cors";
import questionarioRoutes from "./routes/questionario.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", questionarioRoutes);

app.get("/teste-direto", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("API rodando em http://localhost:3000");
});
