import { DatosDominioInvalidosError } from "./errors.js";

export class Evento {
    constructor({
        id = null,
        nombre,
        descripcion = "",
        categoria,
        fecha,
        tiposEntrada = [],
        multimedia = [],
        organizador
    }) {
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new DatosDominioInvalidosError("El nombre del evento es obligatorio");
        }
        if (!categoria) {
            throw new DatosDominioInvalidosError("La categoría del evento es obligatoria");
        }
        const fechaParsed = fecha instanceof Date ? fecha : new Date(fecha);
        if (!fecha || Number.isNaN(fechaParsed.getTime())) {
            throw new DatosDominioInvalidosError("La fecha del evento es inválida");
        }
        if (!organizador) {
            throw new DatosDominioInvalidosError("El organizador del evento es obligatorio");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.fecha = fechaParsed;
        this.tiposEntrada = Array.isArray(tiposEntrada) ? [...tiposEntrada] : [];
        this.multimedia = Array.isArray(multimedia) ? [...multimedia] : [];
        this.organizador = organizador;
    }

    tuPrecioEstaEntre(min, max) {
        return this.tiposEntrada.some(
            (tipo) => tipo.precio >= min && tipo.precio <= max
        );
    }

    precioMinimo() {
        if (this.tiposEntrada.length === 0) {
            return 0;
        }
        return Math.min(...this.tiposEntrada.map((tipo) => tipo.precio));
    }

    cupoTotalDisponible() {
        return this.tiposEntrada.reduce((acc, tipo) => acc + tipo.cupo, 0);
    }

    estaAgotado() {
        return this.cupoTotalDisponible() === 0;
    }

    yaOcurrio(fechaReferencia = new Date()) {
        const ref = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
        return this.fecha.getTime() <= ref.getTime();
    }

    diasParaElEvento(fechaReferencia = new Date()) {
        const ref = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
        const diffMs = this.fecha.getTime() - ref.getTime();
        if (diffMs <= 0) {
            return 0;
        }
        const msPorDia = 1000 * 60 * 60 * 24;
        return Math.ceil(diffMs / msPorDia);
    }

    agregarTipoEntrada(tipoEntrada) {
        if (!tipoEntrada) {
            throw new DatosDominioInvalidosError("El tipo de entrada es obligatorio");
        }
        this.tiposEntrada.push(tipoEntrada);
    }

    coincideConBusqueda(texto) {
        if (!texto || !texto.trim()) {
            return true;
        }
        const termino = texto.trim().toLowerCase();
        return (
            this.nombre.toLowerCase().includes(termino) ||
            (this.descripcion && this.descripcion.toLowerCase().includes(termino))
        );
    }
}

export default Evento;
