import { Router } from "express";
import { compraController } from "../controllers/index.js";

const router = Router();

router.get("/", compraController.listar);
router.get("/:id", compraController.obtenerPorId);
router.post("/", compraController.crear);
router.patch("/:id", compraController.actualizarEstado);
router.delete("/:id", compraController.cancelar);

router.get("/:id/mensajes", compraController.listarMensajes);
router.post("/:id/mensajes", compraController.crearMensaje);

export default router;
