import { categoriaService as defaultCategoriaService } from "../services/index.js";

export class CategoriaController {
    constructor({ categoriaService = defaultCategoriaService } = {}) {
        this.categoriaService = categoriaService;
    }

    listar = (req, res) => {
        const categorias = this.categoriaService.listarCategorias();
        res.status(200).json(categorias);
    };

    obtenerPorId = (req, res) => {
        const categoria = this.categoriaService.obtenerCategoriaPorId(req.params.id);
        res.status(200).json(categoria);
    };

    crear = (req, res) => {
        const nuevaCategoria = this.categoriaService.crearCategoria(req.body);
        res.status(201).json(nuevaCategoria);
    };
}

export default CategoriaController;
