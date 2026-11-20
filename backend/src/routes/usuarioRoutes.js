import { Router } from "express";
import { usuarioController } from "../controllers/index.js";
import { validateBody } from "../middlewares/validateRequest.js";
import {
    crearUsuarioSchema,
    registroUsuarioSchema,
    loginUsuarioSchema,
    agregarFavoritoSchema
} from "../validators/schemas.js";

const router = Router();

router.get("/", usuarioController.listar);
router.post("/registro", validateBody(registroUsuarioSchema), usuarioController.registrar);
router.post("/login", validateBody(loginUsuarioSchema), usuarioController.login);
router.get("/:id", usuarioController.obtenerPorId);
router.post("/", validateBody(crearUsuarioSchema), usuarioController.crear);

router.get("/:id/reputacion", usuarioController.obtenerReputacion);
router.get("/:id/favoritos", usuarioController.listarFavoritos);
router.post("/:id/favoritos", validateBody(agregarFavoritoSchema), usuarioController.agregarFavorito);
router.delete("/:id/favoritos/:eventoId", usuarioController.quitarFavorito);

export default router;
