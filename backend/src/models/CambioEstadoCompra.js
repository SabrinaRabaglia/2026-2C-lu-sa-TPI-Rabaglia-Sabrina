import { EstadoCompra } from "./EstadoCompra.js";

export class CambioEstadoCompra {
    constructor({ id = null, compra, estado, quien, fechaHora = new Date() }) {
        if (!compra) {
            throw new Error("La compra asociada al cambio de estado es obligatoria");
        }
        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new Error(`El estado "${estado}" no es un EstadoCompra válido`);
        }
        if (!quien) {
            throw new Error("El usuario que realiza el cambio de estado es obligatorio");
        }
        const fechaParsed = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
        if (Number.isNaN(fechaParsed.getTime())) {
            throw new Error("La fecha y hora del cambio de estado es inválida");
        }

        this.id = id;
        this.compra = compra;
        this.estado = estado;
        this.quien = quien;
        this.fechaHora = fechaParsed;
    }
}

export default CambioEstadoCompra;
