import { eventoService as defaultEventoService } from "../services/index.js";

export class EventoController {
    constructor({ eventoService = defaultEventoService } = {}) {
        this.eventoService = eventoService;
    }

    listar = (req, res) => {
        const eventos = this.eventoService.buscarEventos(req.query);
        res.status(200).json(eventos);
    };

    obtenerPorId = (req, res) => {
        const evento = this.eventoService.obtenerEventoPorId(req.params.id);
        res.status(200).json(evento);
    };

    crear = (req, res) => {
        const nuevoEvento = this.eventoService.crearEvento(req.body);
        res.status(201).json(nuevoEvento);
    };
}

export default EventoController;
