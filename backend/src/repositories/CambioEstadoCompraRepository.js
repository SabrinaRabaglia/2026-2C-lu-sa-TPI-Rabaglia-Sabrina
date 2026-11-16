import { randomUUID } from "node:crypto";

export class CambioEstadoCompraRepository {
    constructor() {
        this.cambiosEstado = [];
    }

    findAll() {
        return [...this.cambiosEstado];
    }

    findById(id) {
        return this.cambiosEstado.find((ce) => ce.id === id) || null;
    }

    findByCompraId(compraId) {
        return this.cambiosEstado
            .filter((ce) => ce.compra?.id === compraId)
            .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
    }

    save(cambioEstado) {
        if (!cambioEstado) {
            throw new Error("Se debe proporcionar un cambio de estado válido");
        }
        if (!cambioEstado.id) {
            cambioEstado.id = randomUUID();
        }
        const index = this.cambiosEstado.findIndex((ce) => ce.id === cambioEstado.id);
        if (index >= 0) {
            this.cambiosEstado[index] = cambioEstado;
        } else {
            this.cambiosEstado.push(cambioEstado);
        }
        return cambioEstado;
    }

    deleteById(id) {
        const index = this.cambiosEstado.findIndex((ce) => ce.id === id);
        if (index === -1) {
            return false;
        }
        this.cambiosEstado.splice(index, 1);
        return true;
    }

    clear() {
        this.cambiosEstado = [];
    }
}

export default CambioEstadoCompraRepository;
