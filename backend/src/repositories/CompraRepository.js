import { randomUUID } from "node:crypto";

export class CompraRepository {
    constructor() {
        this.compras = [];
    }

    findAll() {
        return [...this.compras];
    }

    findById(id) {
        return this.compras.find((c) => c.id === id) || null;
    }

    findByCompradorId(compradorId) {
        return this.compras.filter((c) => c.comprador?.id === compradorId);
    }

    findByEventoId(eventoId) {
        return this.compras.filter((c) => c.evento?.id === eventoId);
    }

    save(compra) {
        if (!compra) {
            throw new Error("Se debe proporcionar una compra válida");
        }
        if (!compra.id) {
            compra.id = randomUUID();
        }
        const index = this.compras.findIndex((c) => c.id === compra.id);
        if (index >= 0) {
            this.compras[index] = compra;
        } else {
            this.compras.push(compra);
        }
        return compra;
    }

    deleteById(id) {
        const index = this.compras.findIndex((c) => c.id === id);
        if (index === -1) {
            return false;
        }
        this.compras.splice(index, 1);
        return true;
    }

    clear() {
        this.compras = [];
    }
}

export default CompraRepository;
