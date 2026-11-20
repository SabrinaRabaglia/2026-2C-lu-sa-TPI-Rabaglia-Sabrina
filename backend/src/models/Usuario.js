import { DatosDominioInvalidosError } from "./errors.js";

export class Usuario {
    constructor({
        id = null,
        nombre,
        apellido,
        email = null,
        password = null,
        rol = "COMPRADOR",
        favoritos = []
    }) {
        if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
            throw new DatosDominioInvalidosError("El nombre del usuario es obligatorio");
        }
        if (!apellido || typeof apellido !== "string" || !apellido.trim()) {
            throw new DatosDominioInvalidosError("El apellido del usuario es obligatorio");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.apellido = apellido.trim();
        this.email = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
        this.password = typeof password === "string" ? password : null;
        this.rol = rol === "ORGANIZADOR" ? "ORGANIZADOR" : "COMPRADOR";
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
            throw new DatosDominioInvalidosError("Se debe proporcionar un evento válido");
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
