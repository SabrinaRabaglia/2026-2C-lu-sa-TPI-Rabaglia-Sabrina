import { randomUUID } from "node:crypto";

export class EventoRepository {
    constructor() {
        this.eventos = [];
    }

    findAll() {
        return [...this.eventos];
    }

    findById(id) {
        return this.eventos.find((ev) => ev.id === id) || null;
    }

    findByOrganizadorId(organizadorId) {
        return this.eventos.filter((ev) => ev.organizador?.id === organizadorId);
    }

    findByCategoriaId(categoriaId) {
        return this.eventos.filter((ev) => ev.categoria?.id === categoriaId);
    }

    buscar({ texto = "", categoriaId = null, precioMin = null, precioMax = null } = {}) {
        return this.eventos.filter((ev) => {
            if (texto && !ev.coincideConBusqueda(texto)) {
                return false;
            }
            if (categoriaId && ev.categoria?.id !== categoriaId) {
                return false;
            }
            if (precioMin !== null || precioMax !== null) {
                const min = precioMin !== null ? Number(precioMin) : 0;
                const max = precioMax !== null ? Number(precioMax) : Number.POSITIVE_INFINITY;
                if (!ev.tuPrecioEstaEntre(min, max)) {
                    return false;
                }
            }
            return true;
        });
    }

    save(evento) {
        if (!evento) {
            throw new Error("Se debe proporcionar un evento válido");
        }
        if (!evento.id) {
            evento.id = randomUUID();
        }
        const index = this.eventos.findIndex((ev) => ev.id === evento.id);
        if (index >= 0) {
            this.eventos[index] = evento;
        } else {
            this.eventos.push(evento);
        }
        return evento;
    }

    deleteById(id) {
        const index = this.eventos.findIndex((ev) => ev.id === id);
        if (index === -1) {
            return false;
        }
        this.eventos.splice(index, 1);
        return true;
    }

    clear() {
        this.eventos = [];
    }
}

export default EventoRepository;
