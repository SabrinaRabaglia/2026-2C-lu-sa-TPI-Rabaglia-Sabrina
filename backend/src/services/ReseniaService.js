import { Resenia } from "../models/index.js";
import {
    reseniaRepository as defaultReseniaRepo,
    compraRepository as defaultCompraRepo,
    eventoRepository as defaultEventoRepo,
    usuarioRepository as defaultUsuarioRepo
} from "../repositories/index.js";

export class ReseniaService {
    constructor({
        reseniaRepository = defaultReseniaRepo,
        compraRepository = defaultCompraRepo,
        eventoRepository = defaultEventoRepo,
        usuarioRepository = defaultUsuarioRepo
    } = {}) {
        this.reseniaRepository = reseniaRepository;
        this.compraRepository = compraRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    crearResenia({ compraId, compradorId = null, puntuacion, detalle = "" }) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }

        if (compradorId && compra.comprador?.id !== compradorId) {
            const error = new Error("Solo el comprador titular de la compra puede calificar el evento");
            error.statusCode = 403;
            throw error;
        }

        if (!compra.puedeSerReseniada()) {
            const error = new Error(
                "Solo se puede reseñar una compra cuya entrada haya sido UTILIZADA"
            );
            error.statusCode = 400;
            throw error;
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
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        return this.reseniaRepository.findByEventoId(eventoId);
    }

    listarReseniasPorOrganizador(organizadorId) {
        const organizador = this.usuarioRepository.findById(organizadorId);
        if (!organizador) {
            const error = new Error(`Organizador con id "${organizadorId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        const resenias = this.reseniaRepository.findByOrganizadorId(organizadorId);
        const promedio = this.reseniaRepository.calcularPromedioOrganizador(organizadorId);

        return {
            organizador,
            promedio,
            totalResenias: resenias.length,
            resenias
        };
    }
}

export default ReseniaService;
