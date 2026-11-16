import {
    EstadoCompra,
    Compra,
    CambioEstadoCompra
} from "../models/index.js";
import {
    compraRepository as defaultCompraRepo,
    usuarioRepository as defaultUsuarioRepo,
    eventoRepository as defaultEventoRepo,
    tipoEntradaRepository as defaultTipoEntradaRepo,
    mensajeRepository as defaultMensajeRepo,
    cambioEstadoCompraRepository as defaultCambioEstadoRepo
} from "../repositories/index.js";

export class CompraService {
    constructor({
        compraRepository = defaultCompraRepo,
        usuarioRepository = defaultUsuarioRepo,
        eventoRepository = defaultEventoRepo,
        tipoEntradaRepository = defaultTipoEntradaRepo,
        mensajeRepository = defaultMensajeRepo,
        cambioEstadoCompraRepository = defaultCambioEstadoRepo
    } = {}) {
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.mensajeRepository = mensajeRepository;
        this.cambioEstadoCompraRepository = cambioEstadoCompraRepository;
    }

    enriquecerCompra(compra, fechaReferencia = new Date()) {
        const cambiosEstado = this.cambioEstadoCompraRepository.findByCompraId(compra.id);
        return {
            ...compra,
            id: compra.id,
            comprador: compra.comprador,
            evento: compra.evento,
            tipoEntrada: compra.tipoEntrada,
            cantidad: compra.cantidad,
            total: compra.total,
            estado: compra.estado,
            mensajes: compra.mensajes,
            diasFaltantesParaEvento: compra.diasFaltantesParaEvento(fechaReferencia),
            puedeCancelarse: compra.puedeCancelarse(fechaReferencia),
            puedeSerReseniada: compra.puedeSerReseniada(),
            cambiosEstado
        };
    }

    obtenerCompraPorId(compraId, fechaReferencia = new Date()) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }
        return this.enriquecerCompra(compra, fechaReferencia);
    }

    listarCompras({ compradorId = null, eventoId = null, organizadorId = null } = {}, fechaReferencia = new Date()) {
        if (eventoId) {
            return this.obtenerComprasPorEvento(eventoId, organizadorId, fechaReferencia);
        }
        if (compradorId) {
            return this.obtenerComprasPorComprador(compradorId, fechaReferencia);
        }
        return this.compraRepository
            .findAll()
            .map((c) => this.enriquecerCompra(c, fechaReferencia));
    }

    obtenerMensajesPorCompra(compraId) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }
        return [...compra.mensajes];
    }

    obtenerComprasPorComprador(compradorId, fechaReferencia = new Date()) {
        const comprador = this.usuarioRepository.findById(compradorId);
        if (!comprador) {
            const error = new Error(`Comprador con id "${compradorId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        const compras = this.compraRepository.findByCompradorId(compradorId);
        return compras.map((c) => this.enriquecerCompra(c, fechaReferencia));
    }

    obtenerComprasPorEvento(eventoId, organizadorId = null, fechaReferencia = new Date()) {
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }

        if (organizadorId && evento.organizador?.id !== organizadorId) {
            const error = new Error("El usuario indicado no es el organizador de este evento");
            error.statusCode = 403;
            throw error;
        }

        const compras = this.compraRepository
            .findByEventoId(eventoId)
            .map((c) => this.enriquecerCompra(c, fechaReferencia));

        const resumenPorEstado = Object.values(EstadoCompra).reduce((acc, estado) => {
            acc[estado] = compras.filter((c) => c.estado === estado);
            return acc;
        }, {});

        const disponibilidadEntradas = evento.tiposEntrada.map((tipo) => ({
            id: tipo.id,
            nombre: tipo.nombre,
            descripcion: tipo.descripcion,
            precio: tipo.precio,
            cupoDisponible: tipo.cupo
        }));

        return {
            eventoId: evento.id,
            nombreEvento: evento.nombre,
            compras,
            resumenPorEstado,
            disponibilidadEntradas
        };
    }

    realizarCompra({
        compradorId,
        eventoId,
        tipoEntradaId,
        cantidad,
        estadoInicial = EstadoCompra.CONFIRMADA,
        fecha = new Date()
    }) {
        const comprador = this.usuarioRepository.findById(compradorId);
        if (!comprador) {
            const error = new Error(`Comprador con id "${compradorId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }

        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }

        const tipoEntrada = evento.tiposEntrada.find((t) => t.id === tipoEntradaId);
        if (!tipoEntrada) {
            const error = new Error(
                `El tipo de entrada "${tipoEntradaId}" no pertenece al evento "${evento.nombre}"`
            );
            error.statusCode = 400;
            throw error;
        }

        const cantidadNum = Number(cantidad);
        tipoEntrada.descontarCupo(cantidadNum);
        this.tipoEntradaRepository.save(tipoEntrada);

        const nuevaCompra = new Compra({
            comprador,
            evento,
            tipoEntrada,
            cantidad: cantidadNum,
            estado: estadoInicial
        });
        this.compraRepository.save(nuevaCompra);

        const cambioEstado = new CambioEstadoCompra({
            compra: nuevaCompra,
            estado: estadoInicial,
            quien: comprador,
            fechaHora: fecha
        });
        this.cambioEstadoCompraRepository.save(cambioEstado);

        return this.enriquecerCompra(nuevaCompra, fecha);
    }

    actualizarEstadoCompra({ compraId, estado, nuevoEstado, usuarioId = null, fechaHora = new Date() }) {
        const estadoDestino = nuevoEstado || estado;
        if (estadoDestino === EstadoCompra.CANCELADA || estadoDestino === EstadoCompra.REEMBOLSADA) {
            return this.cancelarCompra({ compraId, usuarioId, fechaReferencia: fechaHora });
        }

        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }

        let responsable = compra.evento?.organizador || compra.comprador;
        if (usuarioId) {
            const usuario = this.usuarioRepository.findById(usuarioId);
            if (!usuario) {
                const error = new Error(`Usuario con id "${usuarioId}" no encontrado`);
                error.statusCode = 404;
                throw error;
            }
            responsable = usuario;
        }

        compra.actualizarEstado(estadoDestino);
        this.compraRepository.save(compra);

        const cambioEstado = new CambioEstadoCompra({
            compra,
            estado: estadoDestino,
            quien: responsable,
            fechaHora
        });
        this.cambioEstadoCompraRepository.save(cambioEstado);

        return this.enriquecerCompra(compra, fechaHora);
    }

    cancelarCompra({ compraId, usuarioId = null, fechaReferencia = new Date() }) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }

        let responsable = compra.comprador;
        if (usuarioId) {
            const usuario = this.usuarioRepository.findById(usuarioId);
            if (!usuario) {
                const error = new Error(`Usuario con id "${usuarioId}" no encontrado`);
                error.statusCode = 404;
                throw error;
            }
            responsable = usuario;
        }

        compra.cancelar(fechaReferencia, EstadoCompra.REEMBOLSADA);
        this.tipoEntradaRepository.save(compra.tipoEntrada);
        this.compraRepository.save(compra);

        const cambioEstado = new CambioEstadoCompra({
            compra,
            estado: compra.estado,
            quien: responsable,
            fechaHora: fechaReferencia
        });
        this.cambioEstadoCompraRepository.save(cambioEstado);

        return this.enriquecerCompra(compra, fechaReferencia);
    }

    enviarMensaje({ compraId, usuarioId, mensaje, fecha = new Date() }) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            const error = new Error(`Compra con id "${compraId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }

        const usuario = this.usuarioRepository.findById(usuarioId);
        if (!usuario) {
            const error = new Error(`Usuario con id "${usuarioId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }

        const nuevoMensaje = compra.agregarMensaje(usuario, mensaje, fecha);
        this.mensajeRepository.save(nuevoMensaje);
        this.compraRepository.save(compra);

        return nuevoMensaje;
    }
}

export default CompraService;
