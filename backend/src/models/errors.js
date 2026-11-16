export class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DatosDominioInvalidosError extends DomainError {}

export class CupoInsuficienteError extends DomainError {
    constructor(nombreTipoEntrada, disponible, solicitado) {
        super(
            `No hay cupo suficiente para "${nombreTipoEntrada}". Disponible: ${disponible}, solicitado: ${solicitado}`
        );
        this.nombreTipoEntrada = nombreTipoEntrada;
        this.disponible = disponible;
        this.solicitado = solicitado;
    }
}

export class EstadoCompraInvalidoError extends DomainError {
    constructor(estado) {
        super(`El estado "${estado}" no es un EstadoCompra válido`);
        this.estado = estado;
    }
}

export class CancelacionCompraInvalidaError extends DomainError {
    constructor(
        mensaje = "No se puede cancelar la compra: ya fue utilizada, ya está cancelada o el evento ya se realizó"
    ) {
        super(mensaje);
    }
}

export class CompraNoReseniableError extends DomainError {
    constructor(
        mensaje = "Solo se puede reseñar una compra cuya entrada haya sido UTILIZADA"
    ) {
        super(mensaje);
    }
}

export class UsuarioNoParticipanteDelChatError extends DomainError {
    constructor(
        mensaje = "Solo el comprador o el organizador del evento pueden enviar mensajes en esta compra"
    ) {
        super(mensaje);
    }
}

export class PuntuacionInvalidaError extends DomainError {
    constructor(
        mensaje = "La puntuación de la reseña debe ser un número entre 1 y 5"
    ) {
        super(mensaje);
    }
}
