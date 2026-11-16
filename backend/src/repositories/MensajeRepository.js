import { randomUUID } from "node:crypto";

export class MensajeRepository {
    constructor() {
        this.mensajes = [];
    }

    findAll() {
        return [...this.mensajes];
    }

    findById(id) {
        return this.mensajes.find((m) => m.id === id) || null;
    }

    findByUsuarioId(usuarioId) {
        return this.mensajes.filter((m) => m.usuario?.id === usuarioId);
    }

    save(mensaje) {
        if (!mensaje) {
            throw new Error("Se debe proporcionar un mensaje válido");
        }
        if (!mensaje.id) {
            mensaje.id = randomUUID();
        }
        const index = this.mensajes.findIndex((m) => m.id === mensaje.id);
        if (index >= 0) {
            this.mensajes[index] = mensaje;
        } else {
            this.mensajes.push(mensaje);
        }
        return mensaje;
    }

    deleteById(id) {
        const index = this.mensajes.findIndex((m) => m.id === id);
        if (index === -1) {
            return false;
        }
        this.mensajes.splice(index, 1);
        return true;
    }

    clear() {
        this.mensajes = [];
    }
}

export default MensajeRepository;
