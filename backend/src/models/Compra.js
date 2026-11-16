import { EstadoCompra } from "./EstadoCompra.js";
import { Mensaje } from "./Mensaje.js";
import {
    DatosDominioInvalidosError,
    EstadoCompraInvalidoError,
    CancelacionCompraInvalidaError,
    UsuarioNoParticipanteDelChatError
} from "./errors.js";

export class Compra {
    constructor({
        id = null,
        comprador,
        evento,
        tipoEntrada,
        cantidad,
        total = null,
        estado = EstadoCompra.PENDIENTE,
        mensajes = []
    }) {
        if (!comprador) {
            throw new DatosDominioInvalidosError("El comprador es obligatorio");
        }
        if (!evento) {
            throw new DatosDominioInvalidosError("El evento es obligatorio");
        }
        if (!tipoEntrada) {
            throw new DatosDominioInvalidosError("El tipo de entrada es obligatorio");
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new DatosDominioInvalidosError("La cantidad de entradas debe ser un entero mayor a 0");
        }
        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new EstadoCompraInvalidoError(estado);
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantidad;
        this.total = total !== null ? total : tipoEntrada.precio * cantidad;
        this.estado = estado;
        this.mensajes = Array.isArray(mensajes) ? [...mensajes] : [];
    }

    actualizarEstado(nuevoEstado) {
        if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
            throw new EstadoCompraInvalidoError(nuevoEstado);
        }
        this.estado = nuevoEstado;
    }

    puedeCancelarse(fechaReferencia = new Date()) {
        const estadosNoCancelables = [
            EstadoCompra.UTILIZADA,
            EstadoCompra.CANCELADA,
            EstadoCompra.REEMBOLSADA
        ];
        if (estadosNoCancelables.includes(this.estado)) {
            return false;
        }
        return !this.evento.yaOcurrio(fechaReferencia);
    }

    cancelar(fechaReferencia = new Date(), estadoFinal = EstadoCompra.REEMBOLSADA) {
        if (!this.puedeCancelarse(fechaReferencia)) {
            throw new CancelacionCompraInvalidaError();
        }
        this.tipoEntrada.reintegrarCupo(this.cantidad);
        this.actualizarEstado(estadoFinal);
    }

    diasFaltantesParaEvento(fechaReferencia = new Date()) {
        if (this.estado !== EstadoCompra.CONFIRMADA) {
            return null;
        }
        return this.evento.diasParaElEvento(fechaReferencia);
    }

    puedeSerReseniada() {
        return this.estado === EstadoCompra.UTILIZADA;
    }

    esParticipanteDelChat(usuario) {
        if (!usuario) return false;
        const mismoUsuario = (u1, u2) =>
            u1 === u2 || (u1?.id !== null && u1?.id !== undefined && u1?.id === u2?.id);

        return (
            mismoUsuario(usuario, this.comprador) ||
            mismoUsuario(usuario, this.evento.organizador)
        );
    }

    agregarMensaje(usuario, texto, fecha = new Date()) {
        if (!this.esParticipanteDelChat(usuario)) {
            throw new UsuarioNoParticipanteDelChatError();
        }
        const nuevoMensaje = new Mensaje({
            usuario,
            mensaje: texto,
            enviado: fecha
        });
        this.mensajes.push(nuevoMensaje);
        return nuevoMensaje;
    }
}

export default Compra;
