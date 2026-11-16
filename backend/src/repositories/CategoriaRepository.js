import { randomUUID } from "node:crypto";

export class CategoriaRepository {
    constructor() {
        this.categorias = [];
    }

    findAll() {
        return [...this.categorias];
    }

    findById(id) {
        return this.categorias.find((cat) => cat.id === id) || null;
    }

    findByNombre(nombre) {
        if (!nombre || typeof nombre !== "string") return null;
        const buscado = nombre.trim().toLowerCase();
        return this.categorias.find((cat) => cat.nombre.toLowerCase() === buscado) || null;
    }

    save(categoria) {
        if (!categoria) {
            throw new Error("Se debe proporcionar una categoría válida");
        }
        if (!categoria.id) {
            categoria.id = randomUUID();
        }
        const index = this.categorias.findIndex((cat) => cat.id === categoria.id);
        if (index >= 0) {
            this.categorias[index] = categoria;
        } else {
            this.categorias.push(categoria);
        }
        return categoria;
    }

    deleteById(id) {
        const index = this.categorias.findIndex((cat) => cat.id === id);
        if (index === -1) {
            return false;
        }
        this.categorias.splice(index, 1);
        return true;
    }

    clear() {
        this.categorias = [];
    }
}

export default CategoriaRepository;
