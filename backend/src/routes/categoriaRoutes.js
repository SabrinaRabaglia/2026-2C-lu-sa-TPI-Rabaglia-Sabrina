import { Router } from "express";
import { categoriaController } from "../controllers/index.js";

const router = Router();

router.get("/", categoriaController.listar);
router.get("/:id", categoriaController.obtenerPorId);
router.post("/", categoriaController.crear);

export default router;
