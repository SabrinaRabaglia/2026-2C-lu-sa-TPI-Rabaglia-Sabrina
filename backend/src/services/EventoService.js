import { Evento, TipoEntrada } from "../models/index.js";
import {
    eventoRepository as defaultEventoRepo,
    categoriaRepository as defaultCategoriaRepo,
    usuarioRepository as defaultUsuarioRepo,
    tipoEntradaRepository as defaultTipoEntradaRepo,
    reseniaRepository as defaultReseniaRepo
} from "../repositories/index.js";
import { UsuarioService } from "./UsuarioService.js";
import {
    EntidadNoEncontradaError,
    EventoSinTiposEntradaError
} from "./errors.js";

export class EventoService {
    constructor({
        eventoRepository = defaultEventoRepo,
        categoriaRepository = defaultCategoriaRepo,
        usuarioRepository = defaultUsuarioRepo,
        tipoEntradaRepository = defaultTipoEntradaRepo,
        reseniaRepository = defaultReseniaRepo,
        usuarioService = null
    } = {}) {
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.reseniaRepository = reseniaRepository;
        this.usuarioService =
            usuarioService ||
            new UsuarioService({
                usuarioRepository,
                eventoRepository,
                reseniaRepository
            });
    }

    enriquecerEvento(evento) {
        const organizadorId = evento.organizador?.id;
        const reseniasOrganizador = organizadorId
            ? this.reseniaRepository.findByOrganizadorId(organizadorId)
            : [];
        const puntajeOrganizador = organizadorId
            ? this.usuarioService.calcularPromedioOrganizador(organizadorId)
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
            throw new EntidadNoEncontradaError("Evento", eventoId);
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
            throw new EntidadNoEncontradaError("Organizador", organizadorId);
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
            throw new EntidadNoEncontradaError("Categoría", categoriaId);
        }

        const organizador = this.usuarioRepository.findById(organizadorId);
        if (!organizador) {
            throw new EntidadNoEncontradaError("Organizador", organizadorId);
        }

        if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
            throw new EventoSinTiposEntradaError();
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
