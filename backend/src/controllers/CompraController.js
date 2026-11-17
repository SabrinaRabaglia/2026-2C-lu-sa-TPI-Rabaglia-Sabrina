import { compraService as defaultCompraService } from "../services/index.js";

export class CompraController {
    constructor({ compraService = defaultCompraService } = {}) {
        this.compraService = compraService;
    }

    listar = (req, res) => {
        const compras = this.compraService.listarCompras({
            ...req.query,
            eventoId: req.params.eventoId || req.query.eventoId || null
        });
        res.status(200).json(compras);
    };

    obtenerPorId = (req, res) => {
        const compra = this.compraService.obtenerCompraPorId(req.params.id);
        res.status(200).json(compra);
    };

    crear = (req, res) => {
        const nuevaCompra = this.compraService.realizarCompra(req.body);
        res.status(201).json(nuevaCompra);
    };

    actualizarEstado = (req, res) => {
        const compraActualizada = this.compraService.actualizarEstadoCompra({
            compraId: req.params.id,
            ...req.body
        });
        res.status(200).json(compraActualizada);
    };

    cancelar = (req, res) => {
        const compraCancelada = this.compraService.cancelarCompra({
            compraId: req.params.id,
            usuarioId: req.body?.usuarioId || req.query?.usuarioId || null
        });
        res.status(200).json(compraCancelada);
    };

    listarMensajes = (req, res) => {
        const mensajes = this.compraService.obtenerMensajesPorCompra(req.params.id);
        res.status(200).json(mensajes);
    };

    crearMensaje = (req, res) => {
        const nuevoMensaje = this.compraService.enviarMensaje({
            compraId: req.params.id,
            ...req.body
        });
        res.status(201).json(nuevoMensaje);
    };
}

export default CompraController;
