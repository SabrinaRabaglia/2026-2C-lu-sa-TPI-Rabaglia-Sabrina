import { EstadoCompra } from "./EstadoCompra.js";
import {
    DatosDominioInvalidosError,
    EstadoCompraInvalidoError
} from "./errors.js";

export class CambioEstadoCompra {
    constructor({ id = null, compra, estado, quien, fechaHora = new Date() }) {
        if (!compra) {
            throw new DatosDominioInvalidosError("La compra asociada al cambio de estado es obligatoria");
        }
        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new EstadoCompraInvalidoError(estado);
        }
        if (!quien) {
            throw new DatosDominioInvalidosError("El usuario que realiza el cambio de estado es obligatorio");
        }
        const fechaParsed = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
        if (Number.isNaN(fechaParsed.getTime())) {
            throw new DatosDominioInvalidosError("La fecha y hora del cambio de estado es inválida");
        }

        this.id = id;
        this.compra = compra;
        this.estado = estado;
        this.quien = quien;
        this.fechaHora = fechaParsed;
    }
}

export default CambioEstadoCompra;
