import { Categoria } from "../models/index.js";
import { categoriaRepository as defaultCategoriaRepo } from "../repositories/index.js";

export class CategoriaService {
    constructor({ categoriaRepository = defaultCategoriaRepo } = {}) {
        this.categoriaRepository = categoriaRepository;
    }

    listarCategorias() {
        return this.categoriaRepository.findAll();
    }

    obtenerCategoriaPorId(id) {
        const categoria = this.categoriaRepository.findById(id);
        if (!categoria) {
            const error = new Error(`Categoría con id "${id}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }
        return categoria;
    }

    crearCategoria({ nombre, descripcion = "" }) {
        const existente = this.categoriaRepository.findByNombre(nombre);
        if (existente) {
            const error = new Error(`Ya existe una categoría con el nombre "${nombre}"`);
            error.statusCode = 409;
            throw error;
        }
        const nuevaCategoria = new Categoria({ nombre, descripcion });
        return this.categoriaRepository.save(nuevaCategoria);
    }
}

export default CategoriaService;
