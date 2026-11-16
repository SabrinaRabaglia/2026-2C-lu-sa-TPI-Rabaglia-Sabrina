import { CategoriaService } from "./CategoriaService.js";
import { UsuarioService } from "./UsuarioService.js";
import { EventoService } from "./EventoService.js";
import { CompraService } from "./CompraService.js";
import { ReseniaService } from "./ReseniaService.js";

export {
    CategoriaService,
    UsuarioService,
    EventoService,
    CompraService,
    ReseniaService
};
export * from "./errors.js";

export const categoriaService = new CategoriaService();
export const usuarioService = new UsuarioService();
export const eventoService = new EventoService({ usuarioService });
export const compraService = new CompraService();
export const reseniaService = new ReseniaService({ usuarioService });

export const services = {
    categoriaService,
    usuarioService,
    eventoService,
    compraService,
    reseniaService
};

export default services;
