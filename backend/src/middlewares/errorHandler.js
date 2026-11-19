import { RequestValidationError } from "../validators/errors.js";
import {
    DomainError,
    DatosDominioInvalidosError,
    CupoInsuficienteError,
    EstadoCompraInvalidoError,
    CancelacionCompraInvalidaError,
    CompraNoReseniableError,
    UsuarioNoParticipanteDelChatError,
    PuntuacionInvalidaError,
    EventoFinalizadoError,
    AutoCompraNoPermitidaError,
    CompraYaReseniadaError,
    FechaEventoInvalidaError
} from "../models/index.js";
import {
    ServiceError,
    EntidadNoEncontradaError,
    ConflictoEntidadError,
    OperacionNoAutorizadaError,
    TipoEntradaNoPerteneceAlEventoError,
    EventoSinTiposEntradaError
} from "../services/index.js";

export function errorHandler(err, req, res, next) {
    // 1. Errores de validación de la capa HTTP (Request / DTO)
    if (err instanceof RequestValidationError) {
        return res.status(400).json({
            tipo: err.name,
            error: err.message,
            detalles: err.detalles
        });
    }

    // 2. Excepciones propias de la capa de Servicios
    if (err instanceof EntidadNoEncontradaError) {
        return res.status(404).json({
            tipo: err.name,
            error: err.message
        });
    }

    if (err instanceof ConflictoEntidadError) {
        return res.status(409).json({
            tipo: err.name,
            error: err.message
        });
    }

    if (err instanceof OperacionNoAutorizadaError) {
        return res.status(403).json({
            tipo: err.name,
            error: err.message
        });
    }

    if (
        err instanceof TipoEntradaNoPerteneceAlEventoError ||
        err instanceof EventoSinTiposEntradaError ||
        err instanceof ServiceError
    ) {
        return res.status(400).json({
            tipo: err.name,
            error: err.message
        });
    }

    // 3. Excepciones propias de la capa de Dominio
    if (err instanceof UsuarioNoParticipanteDelChatError) {
        return res.status(403).json({
            tipo: err.name,
            error: err.message
        });
    }

    if (
        err instanceof CupoInsuficienteError ||
        err instanceof CancelacionCompraInvalidaError ||
        err instanceof CompraNoReseniableError ||
        err instanceof EventoFinalizadoError ||
        err instanceof AutoCompraNoPermitidaError ||
        err instanceof CompraYaReseniadaError
    ) {
        return res.status(409).json({
            tipo: err.name,
            error: err.message
        });
    }

    if (
        err instanceof DatosDominioInvalidosError ||
        err instanceof EstadoCompraInvalidoError ||
        err instanceof PuntuacionInvalidaError ||
        err instanceof FechaEventoInvalidaError ||
        err instanceof DomainError
    ) {
        return res.status(422).json({
            tipo: err.name,
            error: err.message
        });
    }

    // 4. Error inesperado
    return res.status(500).json({
        tipo: "InternalServerError",
        error: err.message || "Error inesperado en el servidor"
    });
}

export default errorHandler;
