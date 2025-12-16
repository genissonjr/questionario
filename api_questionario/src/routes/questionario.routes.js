import { Router } from "express";
import {
  iniciarQuestionario,
  listarPerguntas,
  finalizarQuestionario
} from "../controllers/questionario.controller.js";

const router = Router();

router.post("/iniciar", iniciarQuestionario);
router.get("/perguntas", listarPerguntas);
router.post("/finalizar", finalizarQuestionario);


export default router;

