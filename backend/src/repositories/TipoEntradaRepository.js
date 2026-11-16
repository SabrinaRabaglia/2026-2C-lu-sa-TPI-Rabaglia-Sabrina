import { randomUUID } from "node:crypto";

export class TipoEntradaRepository {
    constructor() {
        this.tiposEntrada = [];
    }

    findAll() {
        return [...this.tiposEntrada];
    }

    findById(id) {
        return this.tiposEntrada.find((t) => t.id === id) || null;
    }

    save(tipoEntrada) {
        if (!tipoEntrada) {
            throw new Error("Se debe proporcionar un tipo de entrada válido");
        }
        if (!tipoEntrada.id) {
            tipoEntrada.id = randomUUID();
        }
        const index = this.tiposEntrada.findIndex((t) => t.id === tipoEntrada.id);
        if (index >= 0) {
            this.tiposEntrada[index] = tipoEntrada;
        } else {
            this.tiposEntrada.push(tipoEntrada);
        }
        return tipoEntrada;
    }

    deleteById(id) {
        const index = this.tiposEntrada.findIndex((t) => t.id === id);
        if (index === -1) {
            return false;
        }
        this.tiposEntrada.splice(index, 1);
        return true;
    }

    clear() {
        this.tiposEntrada = [];
    }
}

export default TipoEntradaRepository;
