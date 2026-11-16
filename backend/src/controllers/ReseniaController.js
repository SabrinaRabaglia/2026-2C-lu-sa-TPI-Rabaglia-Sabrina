import { reseniaService as defaultReseniaService } from "../services/index.js";

export class ReseniaController {
    constructor({ reseniaService = defaultReseniaService } = {}) {
        this.reseniaService = reseniaService;
    }

    listar = (req, res) => {
        const resenias = this.reseniaService.listarResenias(req.query);
        res.status(200).json(resenias);
    };

    crear = (req, res) => {
        const nuevaResenia = this.reseniaService.crearResenia(req.body);
        res.status(201).json(nuevaResenia);
    };
}

export default ReseniaController;
