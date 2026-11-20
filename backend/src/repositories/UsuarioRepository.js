import { randomUUID } from "node:crypto";

export class UsuarioRepository {
    constructor() {
        this.usuarios = [];
    }

    findAll() {
        return [...this.usuarios];
    }

    findById(id) {
        return this.usuarios.find((u) => u.id === id) || null;
    }

    findByEmail(email) {
        if (!email || typeof email !== "string") return null;
        const normalizado = email.trim().toLowerCase();
        return this.usuarios.find((u) => u.email === normalizado) || null;
    }

    save(usuario) {
        if (!usuario) {
            throw new Error("Se debe proporcionar un usuario válido");
        }
        if (!usuario.id) {
            usuario.id = randomUUID();
        }
        const index = this.usuarios.findIndex((u) => u.id === usuario.id);
        if (index >= 0) {
            this.usuarios[index] = usuario;
        } else {
            this.usuarios.push(usuario);
        }
        return usuario;
    }

    deleteById(id) {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index === -1) {
            return false;
        }
        this.usuarios.splice(index, 1);
        return true;
    }

    clear() {
        this.usuarios = [];
    }
}

export default UsuarioRepository;
