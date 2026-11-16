import { CategoriaRepository } from "./CategoriaRepository.js";
import { UsuarioRepository } from "./UsuarioRepository.js";
import { TipoEntradaRepository } from "./TipoEntradaRepository.js";
import { EventoRepository } from "./EventoRepository.js";
import { CompraRepository } from "./CompraRepository.js";
import { MensajeRepository } from "./MensajeRepository.js";
import { CambioEstadoCompraRepository } from "./CambioEstadoCompraRepository.js";
import { ReseniaRepository } from "./ReseniaRepository.js";

export {
    CategoriaRepository,
    UsuarioRepository,
    TipoEntradaRepository,
    EventoRepository,
    CompraRepository,
    MensajeRepository,
    CambioEstadoCompraRepository,
    ReseniaRepository
};

export const categoriaRepository = new CategoriaRepository();
export const usuarioRepository = new UsuarioRepository();
export const tipoEntradaRepository = new TipoEntradaRepository();
export const eventoRepository = new EventoRepository();
export const compraRepository = new CompraRepository();
export const mensajeRepository = new MensajeRepository();
export const cambioEstadoCompraRepository = new CambioEstadoCompraRepository();
export const reseniaRepository = new ReseniaRepository();

export const repositories = {
    categoriaRepository,
    usuarioRepository,
    tipoEntradaRepository,
    eventoRepository,
    compraRepository,
    mensajeRepository,
    cambioEstadoCompraRepository,
    reseniaRepository
};

export default repositories;
