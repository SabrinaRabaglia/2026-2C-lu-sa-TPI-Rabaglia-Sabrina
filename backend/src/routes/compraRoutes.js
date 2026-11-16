import { Router } from "express";
import { compraController } from "../controllers/index.js";
import { validateBody } from "../middlewares/validateRequest.js";
import {
    crearCompraSchema,
    actualizarEstadoCompraSchema,
    crearMensajeSchema
} from "../validators/schemas.js";

const router = Router();

router.get("/", compraController.listar);
router.get("/:id", compraController.obtenerPorId);
router.post("/", validateBody(crearCompraSchema), compraController.crear);
router.patch("/:id", validateBody(actualizarEstadoCompraSchema), compraController.actualizarEstado);
router.delete("/:id", compraController.cancelar);

router.get("/:id/mensajes", compraController.listarMensajes);
router.post("/:id/mensajes", validateBody(crearMensajeSchema), compraController.crearMensaje);

export default router;
