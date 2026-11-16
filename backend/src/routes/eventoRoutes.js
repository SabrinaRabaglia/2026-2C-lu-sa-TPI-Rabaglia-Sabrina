import { Router } from "express";
import { eventoController } from "../controllers/index.js";
import { validateBody } from "../middlewares/validateRequest.js";
import { crearEventoSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", eventoController.listar);
router.get("/:id", eventoController.obtenerPorId);
router.post("/", validateBody(crearEventoSchema), eventoController.crear);

export default router;
