import { Router } from "express";
import { categoriaController } from "../controllers/index.js";
import { validateBody } from "../middlewares/validateRequest.js";
import { crearCategoriaSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", categoriaController.listar);
router.get("/:id", categoriaController.obtenerPorId);
router.post("/", validateBody(crearCategoriaSchema), categoriaController.crear);

export default router;
