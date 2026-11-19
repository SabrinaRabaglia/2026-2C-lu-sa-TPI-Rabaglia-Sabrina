import { randomUUID } from "node:crypto";

export class ReseniaRepository {
    constructor() {
        this.resenias = [];
    }

    findAll() {
        return [...this.resenias];
    }

    findById(id) {
        return this.resenias.find((r) => r.id === id) || null;
    }

    findByEventoId(eventoId) {
        return this.resenias.filter((r) => r.evento?.id === eventoId);
    }

    findByOrganizadorId(organizadorId) {
        return this.resenias.filter((r) => r.evento?.organizador?.id === organizadorId);
    }

    findByCompraId(compraId) {
        if (!compraId) return null;
        return this.resenias.find((r) => r.compraId === compraId) || null;
    }

    save(resenia) {
        if (!resenia) {
            throw new Error("Se debe proporcionar una reseña válida");
        }
        if (!resenia.id) {
            resenia.id = randomUUID();
        }
        const index = this.resenias.findIndex((r) => r.id === resenia.id);
        if (index >= 0) {
            this.resenias[index] = resenia;
        } else {
            this.resenias.push(resenia);
        }
        return resenia;
    }

    deleteById(id) {
        const index = this.resenias.findIndex((r) => r.id === id);
        if (index === -1) {
            return false;
        }
        this.resenias.splice(index, 1);
        return true;
    }

    clear() {
        this.resenias = [];
    }
}

export default ReseniaRepository;
