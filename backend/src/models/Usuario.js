export class Usuario {
    constructor({ id = null, nombre, apellido, favoritos = [] }) {
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new Error("El nombre del usuario es obligatorio");
        }
        if (!apellido || typeof apellido !== "string" || !apellido.trim()) {
            throw new Error("El apellido del usuario es obligatorio");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.apellido = apellido.trim();
        this.favoritos = Array.isArray(favoritos) ? [...favoritos] : [];
    }

    nombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    esFavorito(evento) {
        if (!evento) return false;
        return this.favoritos.some((fav) =>
            fav === evento || (fav.id !== null && fav.id !== undefined && fav.id === evento.id)
        );
    }

    agregarFavorito(evento) {
        if (!evento) {
            throw new Error("Se debe proporcionar un evento válido");
        }
        if (!this.esFavorito(evento)) {
            this.favoritos.push(evento);
        }
    }

    quitarFavorito(evento) {
        if (!evento) return;
        this.favoritos = this.favoritos.filter(
            (fav) => !(fav === evento || (fav.id !== null && fav.id !== undefined && fav.id === evento.id))
        );
    }
}

export default Usuario;
