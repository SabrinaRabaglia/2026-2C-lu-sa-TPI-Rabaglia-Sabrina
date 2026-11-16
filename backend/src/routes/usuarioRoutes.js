import { Router } from "express";
import { usuarioController } from "../controllers/index.js";

const router = Router();

router.get("/", usuarioController.listar);
router.get("/:id", usuarioController.obtenerPorId);
router.post("/", usuarioController.crear);

router.get("/:id/favoritos", usuarioController.listarFavoritos);
router.post("/:id/favoritos", usuarioController.agregarFavorito);
router.delete("/:id/favoritos/:eventoId", usuarioController.quitarFavorito);

export default router;
