import { Evento, TipoEntrada } from "../models/index.js";
import {
    eventoRepository as defaultEventoRepo,
    categoriaRepository as defaultCategoriaRepo,
    usuarioRepository as defaultUsuarioRepo,
    tipoEntradaRepository as defaultTipoEntradaRepo,
    reseniaRepository as defaultReseniaRepo
} from "../repositories/index.js";

export class EventoService {
    constructor({
        eventoRepository = defaultEventoRepo,
        categoriaRepository = defaultCategoriaRepo,
        usuarioRepository = defaultUsuarioRepo,
        tipoEntradaRepository = defaultTipoEntradaRepo,
        reseniaRepository = defaultReseniaRepo
    } = {}) {
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.reseniaRepository = reseniaRepository;
    }

    enriquecerEvento(evento) {
        const organizadorId = evento.organizador?.id;
        const reseniasOrganizador = organizadorId
            ? this.reseniaRepository.findByOrganizadorId(organizadorId)
            : [];
        const puntajeOrganizador = organizadorId
            ? this.reseniaRepository.calcularPromedioOrganizador(organizadorId)
            : 0;

        return {
            ...evento,
            id: evento.id,
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            categoria: evento.categoria,
            fecha: evento.fecha,
            tiposEntrada: evento.tiposEntrada,
            multimedia: evento.multimedia,
            organizador: evento.organizador,
            precioMinimo: evento.precioMinimo(),
            puntajeOrganizador,
            reseniasOrganizador
        };
    }

    obtenerEventoPorId(eventoId) {
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        return this.enriquecerEvento(evento);
    }

    buscarEventos({
        texto = "",
        categoriaId = null,
        organizadorId = null,
        precioMin = null,
        precioMax = null,
        ordenarPor = null,
        direccion = null
    } = {}) {
        const min = precioMin !== null && precioMin !== "" ? Number(precioMin) : null;
        const max = precioMax !== null && precioMax !== "" ? Number(precioMax) : null;

        let eventosFiltrados = this.eventoRepository.buscar({
            texto,
            categoriaId,
            precioMin: min,
            precioMax: max
        });

        if (organizadorId) {
            eventosFiltrados = eventosFiltrados.filter(
                (ev) => ev.organizador?.id === organizadorId
            );
        }

        const enriquecidos = eventosFiltrados.map((ev) => this.enriquecerEvento(ev));

        if (ordenarPor) {
            const criterio = ordenarPor.toLowerCase();
            enriquecidos.sort((a, b) => {
                if (criterio === "precio") {
                    const dir = direccion?.toLowerCase() === "desc" ? -1 : 1;
                    return (a.precioMinimo - b.precioMinimo) * dir;
                }
                if (criterio === "fecha") {
                    const dir = direccion?.toLowerCase() === "desc" ? -1 : 1;
                    return (a.fecha.getTime() - b.fecha.getTime()) * dir;
                }
                if (criterio === "puntaje" || criterio === "puntajeorganizador") {
                    const dir = direccion?.toLowerCase() === "asc" ? 1 : -1;
                    return (a.puntajeOrganizador - b.puntajeOrganizador) * dir;
                }
                return 0;
            });
        }

        return enriquecidos;
    }

    listarEventosPorOrganizador(organizadorId) {
        const organizador = this.usuarioRepository.findById(organizadorId);
        if (!organizador) {
            const error = new Error(`Organizador con id "${organizadorId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        return this.eventoRepository
            .findByOrganizadorId(organizadorId)
            .map((ev) => this.enriquecerEvento(ev));
    }

    crearEvento({
        nombre,
        descripcion = "",
        categoriaId,
        fecha,
        tiposEntrada = [],
        multimedia = [],
        organizadorId
    }) {
        const categoria = this.categoriaRepository.findById(categoriaId);
        if (!categoria) {
            const error = new Error(`Categoría con id "${categoriaId}" no encontrada`);
            error.statusCode = 404;
            throw error;
        }

        const organizador = this.usuarioRepository.findById(organizadorId);
        if (!organizador) {
            const error = new Error(`Organizador con id "${organizadorId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }

        if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
            const error = new Error("El evento debe ofrecer al menos un tipo de entrada");
            error.statusCode = 400;
            throw error;
        }

        const instanciasTipos = tiposEntrada.map((t) => {
            const instancia = t instanceof TipoEntrada
                ? t
                : new TipoEntrada({
                    nombre: t.nombre,
                    descripcion: t.descripcion || "",
                    precio: Number(t.precio),
                    cupo: Number(t.cupo)
                });
            return this.tipoEntradaRepository.save(instancia);
        });

        const nuevoEvento = new Evento({
            nombre,
            descripcion,
            categoria,
            fecha,
            tiposEntrada: instanciasTipos,
            multimedia,
            organizador
        });

        this.eventoRepository.save(nuevoEvento);
        return this.enriquecerEvento(nuevoEvento);
    }
}

export default EventoService;
