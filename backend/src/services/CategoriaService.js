import { Categoria } from "../models/index.js";
import { categoriaRepository as defaultCategoriaRepo } from "../repositories/index.js";
import {
    EntidadNoEncontradaError,
    ConflictoEntidadError
} from "./errors.js";

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
            throw new EntidadNoEncontradaError("Categoría", id);
        }
        return categoria;
    }

    crearCategoria({ nombre, descripcion = "" }) {
        const existente = this.categoriaRepository.findByNombre(nombre);
        if (existente) {
            throw new ConflictoEntidadError(`Ya existe una categoría con el nombre "${nombre}"`);
        }
        const nuevaCategoria = new Categoria({ nombre, descripcion });
        return this.categoriaRepository.save(nuevaCategoria);
    }
}

export default CategoriaService;
