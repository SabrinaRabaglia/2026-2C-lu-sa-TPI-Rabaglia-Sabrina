import { CategoriaController } from "./CategoriaController.js";
import { UsuarioController } from "./UsuarioController.js";
import { EventoController } from "./EventoController.js";
import { CompraController } from "./CompraController.js";
import { ReseniaController } from "./ReseniaController.js";

export {
    CategoriaController,
    UsuarioController,
    EventoController,
    CompraController,
    ReseniaController
};

export const categoriaController = new CategoriaController();
export const usuarioController = new UsuarioController();
export const eventoController = new EventoController();
export const compraController = new CompraController();
export const reseniaController = new ReseniaController();
