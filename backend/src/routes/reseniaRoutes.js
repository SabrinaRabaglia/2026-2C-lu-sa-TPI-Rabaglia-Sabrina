import { Router } from "express";
import { reseniaController } from "../controllers/index.js";

const router = Router();

router.get("/", reseniaController.listar);
router.post("/", reseniaController.crear);

export default router;
