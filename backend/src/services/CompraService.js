import {
    EstadoCompra,
    Compra,
    CambioEstadoCompra,
    EventoFinalizadoError,
    AutoCompraNoPermitidaError
} from "../models/index.js";
import {
    compraRepository as defaultCompraRepo,
    usuarioRepository as defaultUsuarioRepo,
    eventoRepository as defaultEventoRepo,
    tipoEntradaRepository as defaultTipoEntradaRepo,
    mensajeRepository as defaultMensajeRepo,
    cambioEstadoCompraRepository as defaultCambioEstadoRepo,
    reseniaRepository as defaultReseniaRepo
} from "../repositories/index.js";
import {
    EntidadNoEncontradaError,
    OperacionNoAutorizadaError,
    TipoEntradaNoPerteneceAlEventoError
} from "./errors.js";

export class CompraService {
    constructor({
        compraRepository = defaultCompraRepo,
        usuarioRepository = defaultUsuarioRepo,
        eventoRepository = defaultEventoRepo,
        tipoEntradaRepository = defaultTipoEntradaRepo,
        mensajeRepository = defaultMensajeRepo,
        cambioEstadoCompraRepository = defaultCambioEstadoRepo,
        reseniaRepository = defaultReseniaRepo
    } = {}) {
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.mensajeRepository = mensajeRepository;
        this.cambioEstadoCompraRepository = cambioEstadoCompraRepository;
        this.reseniaRepository = reseniaRepository;
    }

    enriquecerCompra(compra, fechaReferencia = new Date()) {
        const cambiosEstado = this.cambioEstadoCompraRepository.findByCompraId(compra.id);
        const yaFueReseniada = Boolean(this.reseniaRepository.findByCompraId(compra.id));
        const mensajes = compra.mensajes || [];
        const ultimoMensaje = mensajes.length > 0 ? mensajes[mensajes.length - 1] : null;
        const organizadorId = compra.evento?.organizador?.id;
        const pendienteRespuestaOrganizador = Boolean(
            ultimoMensaje && organizadorId && ultimoMensaje.usuario?.id !== organizadorId
        );

        return {
            ...compra,
            id: compra.id,
            comprador: compra.comprador,
            evento: compra.evento,
            tipoEntrada: compra.tipoEntrada,
            cantidad: compra.cantidad,
            total: compra.total,
            estado: compra.estado,
            mensajes,
            ultimoMensaje,
            pendienteRespuestaOrganizador,
            diasFaltantesParaEvento: compra.diasFaltantesParaEvento(fechaReferencia),
            puedeCancelarse: compra.puedeCancelarse(fechaReferencia),
            yaFueReseniada,
            puedeSerReseniada: compra.puedeSerReseniada(yaFueReseniada),
            cambiosEstado
        };
    }

    obtenerCompraPorId(compraId, fechaReferencia = new Date()) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            throw new EntidadNoEncontradaError("Compra", compraId);
        }
        return this.enriquecerCompra(compra, fechaReferencia);
    }

    paginarResultados(lista, page = null, limit = null) {
        if (page === null && limit === null) {
            return lista;
        }
        const paginaActual = Math.max(1, Number.parseInt(page, 10) || 1);
        const tamanioPagina = Math.max(1, Number.parseInt(limit, 10) || 10);
        const total = lista.length;
        const totalPages = Math.max(1, Math.ceil(total / tamanioPagina));
        const inicio = (paginaActual - 1) * tamanioPagina;
        const items = lista.slice(inicio, inicio + tamanioPagina);

        return {
            items,
            pagination: {
                page: paginaActual,
                limit: tamanioPagina,
                total,
                totalPages,
                hasNextPage: paginaActual < totalPages,
                hasPrevPage: paginaActual > 1
            }
        };
    }

    listarCompras(
        {
            compradorId = null,
            eventoId = null,
            organizadorId = null,
            soloConMensajes = false,
            page = null,
            limit = null
        } = {},
        fechaReferencia = new Date()
    ) {
        if (eventoId) {
            return this.obtenerComprasPorEvento(eventoId, organizadorId, fechaReferencia);
        }
        let compras;
        if (compradorId) {
            compras = this.obtenerComprasPorComprador(compradorId, fechaReferencia);
        } else if (organizadorId) {
            compras = this.obtenerComprasPorOrganizador(
                organizadorId,
                soloConMensajes,
                fechaReferencia
            );
        } else {
            compras = this.compraRepository
                .findAll()
                .map((c) => this.enriquecerCompra(c, fechaReferencia));
        }

        return this.paginarResultados(compras, page, limit);
    }

    obtenerComprasPorOrganizador(
        organizadorId,
        soloConMensajes = false,
        fechaReferencia = new Date()
    ) {
        const organizador = this.usuarioRepository.findById(organizadorId);
        if (!organizador) {
            throw new EntidadNoEncontradaError("Organizador", organizadorId);
        }
        const filtrarMensajes = soloConMensajes === true || soloConMensajes === "true";

        let compras = this.compraRepository
            .findAll()
            .filter((c) => c.evento?.organizador?.id === organizadorId)
            .map((c) => this.enriquecerCompra(c, fechaReferencia));

        if (filtrarMensajes) {
            compras = compras.filter((c) => c.mensajes.length > 0);
        }

        // Ordenar primero las pendientes de respuesta y luego por fecha del último mensaje (más recientes primero)
        compras.sort((a, b) => {
            if (a.pendienteRespuestaOrganizador !== b.pendienteRespuestaOrganizador) {
                return a.pendienteRespuestaOrganizador ? -1 : 1;
            }
            const fechaA = a.ultimoMensaje ? new Date(a.ultimoMensaje.enviado).getTime() : 0;
            const fechaB = b.ultimoMensaje ? new Date(b.ultimoMensaje.enviado).getTime() : 0;
            return fechaB - fechaA;
        });

        return compras;
    }

    obtenerMensajesPorCompra(compraId) {
        const compra = this.compraRepository.findById(compraId);
        if (!compra) {
            throw new EntidadNoEncontradaError("Compra", compraId);
        }
        return [...compra.mensajes];
    }

    obtenerComprasPorComprador(compradorId, fechaReferencia = new Date()) {
        const comprador = this.usuarioRepository.findById(compradorId);
        if (!comprador) {
            throw new EntidadNoEncontradaError("Comprador", compradorId);
        }
        const compras = this.compraRepository.findByCompradorId(compradorId);
        return compras.map((c) => this.enriquecerCompra(c, fechaReferencia));
    }

    obtenerComprasPorEvento(eventoId, organizadorId = null, fechaReferencia = new Date()) {
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            throw new EntidadNoEncontradaError("Evento", eventoId);
        }

        if (organizadorId && evento.organizador?.id !== organizadorId) {
            throw new OperacionNoAutorizadaError("El usuario indicado no es el organizador de este evento");
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

        const comprasPagas = compras.filter(
            (c) => c.estado === EstadoCompra.CONFIRMADA || c.estado === EstadoCompra.UTILIZADA
        );
        const comprasActivas = compras.filter(
            (c) =>
                c.estado === EstadoCompra.PENDIENTE ||
                c.estado === EstadoCompra.CONFIRMADA ||
                c.estado === EstadoCompra.UTILIZADA
        );
        const recaudacionTotal = comprasPagas.reduce((acc, c) => acc + c.total, 0);
        const entradasVendidas = comprasPagas.reduce((acc, c) => acc + c.cantidad, 0);
        const entradasReservadas = comprasActivas.reduce((acc, c) => acc + c.cantidad, 0);
        const cupoTotalDisponible = evento.cupoTotalDisponible();
        const capacidadTotal = cupoTotalDisponible + entradasReservadas;
        const porcentajeOcupacion =
            capacidadTotal > 0 ? Number(((entradasReservadas / capacidadTotal) * 100).toFixed(2)) : 0;

        return {
            eventoId: evento.id,
            nombreEvento: evento.nombre,
            metricas: {
                recaudacionTotal,
                entradasVendidas,
                entradasReservadas,
                cupoTotalDisponible,
                capacidadTotal,
                porcentajeOcupacion,
                agotado: evento.estaAgotado()
            },
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
        estadoInicial = EstadoCompra.PENDIENTE,
        fecha = new Date()
    }) {
        const comprador = this.usuarioRepository.findById(compradorId);
        if (!comprador) {
            throw new EntidadNoEncontradaError("Comprador", compradorId);
        }

        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            throw new EntidadNoEncontradaError("Evento", eventoId);
        }

        if (evento.yaOcurrio(fecha)) {
            throw new EventoFinalizadoError(evento.nombre);
        }

        if (evento.organizador?.id === comprador.id) {
            throw new AutoCompraNoPermitidaError();
        }

        const tipoEntrada = evento.tiposEntrada.find((t) => t.id === tipoEntradaId);
        if (!tipoEntrada) {
            throw new TipoEntradaNoPerteneceAlEventoError(tipoEntradaId, evento.nombre);
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
            throw new EntidadNoEncontradaError("Compra", compraId);
        }

        let responsable = compra.evento?.organizador || compra.comprador;
        if (usuarioId) {
            const usuario = this.usuarioRepository.findById(usuarioId);
            if (!usuario) {
                throw new EntidadNoEncontradaError("Usuario", usuarioId);
            }
            if (estadoDestino === EstadoCompra.UTILIZADA && !compra.esOrganizadorDelEvento(usuario)) {
                throw new OperacionNoAutorizadaError(
                    "Solo el organizador del evento puede marcar una entrada como UTILIZADA"
                );
            }
            if (!compra.esParticipanteDelChat(usuario)) {
                throw new OperacionNoAutorizadaError(
                    "Solo el comprador titular o el organizador del evento pueden modificar esta compra"
                );
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
            throw new EntidadNoEncontradaError("Compra", compraId);
        }

        let responsable = compra.comprador;
        if (usuarioId) {
            const usuario = this.usuarioRepository.findById(usuarioId);
            if (!usuario) {
                throw new EntidadNoEncontradaError("Usuario", usuarioId);
            }
            if (!compra.esParticipanteDelChat(usuario)) {
                throw new OperacionNoAutorizadaError(
                    "Solo el comprador titular o el organizador del evento pueden cancelar esta compra"
                );
            }
            responsable = usuario;
        }

        // Si la compra estaba PENDIENTE (no pagada), pasa a CANCELADA; si estaba CONFIRMADA, pasa a REEMBOLSADA
        const estadoFinal =
            compra.estado === EstadoCompra.PENDIENTE
                ? EstadoCompra.CANCELADA
                : EstadoCompra.REEMBOLSADA;

        compra.cancelar(fechaReferencia, estadoFinal);
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
            throw new EntidadNoEncontradaError("Compra", compraId);
        }

        const usuario = this.usuarioRepository.findById(usuarioId);
        if (!usuario) {
            throw new EntidadNoEncontradaError("Usuario", usuarioId);
        }

        const nuevoMensaje = compra.agregarMensaje(usuario, mensaje, fecha);
        this.mensajeRepository.save(nuevoMensaje);
        this.compraRepository.save(compra);

        return nuevoMensaje;
    }
}

export default CompraService;
