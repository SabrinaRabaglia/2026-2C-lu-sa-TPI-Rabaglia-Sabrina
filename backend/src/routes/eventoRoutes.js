import { Router } from "express";
import { eventoController } from "../controllers/index.js";

const router = Router();

router.get("/", eventoController.listar);
router.get("/:id", eventoController.obtenerPorId);
router.post("/", eventoController.crear);

export default router;
