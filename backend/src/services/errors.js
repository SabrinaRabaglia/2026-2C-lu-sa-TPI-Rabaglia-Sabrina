export class ServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EntidadNoEncontradaError extends ServiceError {
    constructor(entidad, id) {
        super(`${entidad} con id "${id}" no encontrado/a`);
        this.entidad = entidad;
        this.entidadId = id;
    }
}

export class ConflictoEntidadError extends ServiceError {}

export class OperacionNoAutorizadaError extends ServiceError {}

export class TipoEntradaNoPerteneceAlEventoError extends ServiceError {
    constructor(tipoEntradaId, nombreEvento) {
        super(`El tipo de entrada "${tipoEntradaId}" no pertenece al evento "${nombreEvento}"`);
        this.tipoEntradaId = tipoEntradaId;
        this.nombreEvento = nombreEvento;
    }
}

export class EventoSinTiposEntradaError extends ServiceError {
    constructor() {
        super("El evento debe ofrecer al menos un tipo de entrada");
    }
}
