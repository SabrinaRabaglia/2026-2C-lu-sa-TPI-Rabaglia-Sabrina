import { Router } from "express";
import { reseniaController } from "../controllers/index.js";
import { validateBody } from "../middlewares/validateRequest.js";
import { crearReseniaSchema } from "../validators/schemas.js";

const router = Router();

router.get("/", reseniaController.listar);
router.post("/", validateBody(crearReseniaSchema), reseniaController.crear);

export default router;
