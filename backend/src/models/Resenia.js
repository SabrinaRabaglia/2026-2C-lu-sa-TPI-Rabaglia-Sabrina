export class Resenia {
    constructor({ id = null, comprador, evento, detalle = "", puntuacion }) {
        if (!comprador) {
            throw new Error("El comprador de la reseña es obligatorio");
        }
        if (!evento) {
            throw new Error("El evento de la reseña es obligatorio");
        }
        if (typeof puntuacion !== "number" || puntuacion < 1 || puntuacion > 5) {
            throw new Error("La puntuación debe ser un número entre 1 y 5");
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.detalle = typeof detalle === "string" ? detalle.trim() : "";
        this.puntuacion = puntuacion;
    }

    esDelOrganizador(organizador) {
        if (!organizador || !this.evento?.organizador) {
            return false;
        }
        const orgEvento = this.evento.organizador;
        return (
            orgEvento === organizador ||
            (orgEvento.id !== null && orgEvento.id !== undefined && orgEvento.id === organizador.id)
        );
    }
}

export default Resenia;
