export class TipoEntrada {
    constructor({ id = null, nombre, descripcion = "", precio, cupo }) {
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new Error("El nombre del tipo de entrada es obligatorio");
        }
        if (typeof precio !== "number" || precio < 0) {
            throw new Error("El precio debe ser un número mayor o igual a 0");
        }
        if (!Number.isInteger(cupo) || cupo < 0) {
            throw new Error("El cupo debe ser un número entero mayor o igual a 0");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = descripcion;
        this.precio = precio;
        this.cupo = cupo;
    }

    hayCupoPara(cantidad) {
        return Number.isInteger(cantidad) && cantidad > 0 && this.cupo >= cantidad;
    }

    descontarCupo(cantidad) {
        if (!this.hayCupoPara(cantidad)) {
            throw new Error(`No hay cupo suficiente para "${this.nombre}". Disponible: ${this.cupo}, solicitado: ${cantidad}`);
        }
        this.cupo -= cantidad;
    }

    reintegrarCupo(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new Error("La cantidad a reintegrar debe ser un entero positivo");
        }
        this.cupo += cantidad;
    }
}

export default TipoEntrada;
