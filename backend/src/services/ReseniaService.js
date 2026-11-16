import {
    Resenia,
    CompraNoReseniableError
} from "../models/index.js";
import {
    reseniaRepository as defaultReseniaRepo,
    compraRepository as defaultCompraRepo,
    eventoRepository as defaultEventoRepo,
    usuarioRepository as defaultUsuarioRepo
} from "../repositories/index.js";
import { UsuarioService } from "./UsuarioService.js";
import {
    EntidadNoEncontradaError,
    OperacionNoAutorizadaError
} from "./errors.js";

export class ReseniaService {
    constructor({
        reseniaRepository = defaultReseniaRepo,
        compraRepository = defaultCompraRepo,
        eventoRepository = defaultEventoRepo,
        usuarioRepository = defaultUsuarioRepo,
        usuarioService = null
    } = {}) {
        this.reseniaRepository = reseniaRepository;
        this.compraRepository = compraRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioService =
            usuarioService ||
            new UsuarioService({
                usuarioRepository,
                eventoRepository,
                reseniaRepository
            });
    }

    crearResenia({ compraId, compradorId = null, puntuacion, detalle = "" }) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            throw new EntidadNoEncontradaError("Compra", compraId);
        }

        if (compradorId && compra.comprador?.id !== compradorId) {
            throw new OperacionNoAutorizadaError(
                "Solo el comprador titular de la compra puede calificar el evento"
            );
        }

        if (!compra.puedeSerReseniada()) {
            throw new CompraNoReseniableError();
        }

        const resenia = new Resenia({
            comprador: compra.comprador,
            evento: compra.evento,
            detalle,
            puntuacion: Number(puntuacion)
        });

        return this.reseniaRepository.save(resenia);
    }

    listarResenias({ eventoId = null, organizadorId = null } = {}) {
        if (eventoId) {
            return this.listarReseniasPorEvento(eventoId);
        }
        if (organizadorId) {
            return this.listarReseniasPorOrganizador(organizadorId);
        }
        return this.reseniaRepository.findAll();
    }

    listarReseniasPorEvento(eventoId) {
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            throw new EntidadNoEncontradaError("Evento", eventoId);
        }
        return this.reseniaRepository.findByEventoId(eventoId);
    }

    listarReseniasPorOrganizador(organizadorId) {
        return this.usuarioService.obtenerReputacionOrganizador(organizadorId);
    }
}

export default ReseniaService;
