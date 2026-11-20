import { Usuario } from "../models/index.js";
import {
    usuarioRepository as defaultUsuarioRepo,
    eventoRepository as defaultEventoRepo,
    reseniaRepository as defaultReseniaRepo
} from "../repositories/index.js";
import {
    EntidadNoEncontradaError,
    ConflictoEntidadError,
    CredencialesInvalidasError
} from "./errors.js";

export class UsuarioService {
    constructor({
        usuarioRepository = defaultUsuarioRepo,
        eventoRepository = defaultEventoRepo,
        reseniaRepository = defaultReseniaRepo
    } = {}) {
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
        this.reseniaRepository = reseniaRepository;
    }

    listarUsuarios() {
        return this.usuarioRepository.findAll();
    }

    obtenerUsuarioPorId(id) {
        const usuario = this.usuarioRepository.findById(id);
        if (!usuario) {
            throw new EntidadNoEncontradaError("Usuario", id);
        }
        return usuario;
    }

    crearUsuario({ nombre, apellido, email = null, password = null, rol = "COMPRADOR" }) {
        if (email && this.usuarioRepository.findByEmail(email)) {
            throw new ConflictoEntidadError("Ya existe un usuario registrado con ese email");
        }
        const usuario = new Usuario({ nombre, apellido, email, password, rol });
        return this.usuarioRepository.save(usuario);
    }

    registrarUsuario({ nombre, apellido, email, password, rol = "COMPRADOR" }) {
        if (this.usuarioRepository.findByEmail(email)) {
            throw new ConflictoEntidadError("Ya existe un usuario registrado con ese email");
        }
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            password,
            rol
        });
        return this.usuarioRepository.save(nuevoUsuario);
    }

    autenticarUsuario({ email, password }) {
        const usuario = this.usuarioRepository.findByEmail(email);
        if (!usuario || !usuario.password || usuario.password !== password) {
            throw new CredencialesInvalidasError();
        }
        return usuario;
    }

    calcularPromedioOrganizador(organizadorId) {
        this.obtenerUsuarioPorId(organizadorId);
        const resenias = this.reseniaRepository.findByOrganizadorId(organizadorId);
        if (resenias.length === 0) {
            return 0;
        }
        const suma = resenias.reduce((acc, r) => acc + r.puntuacion, 0);
        return Number((suma / resenias.length).toFixed(2));
    }

    obtenerReputacionOrganizador(organizadorId) {
        const organizador = this.obtenerUsuarioPorId(organizadorId);
        const resenias = this.reseniaRepository.findByOrganizadorId(organizadorId);
        const promedio = this.calcularPromedioOrganizador(organizadorId);
        return {
            organizador,
            promedio,
            totalResenias: resenias.length,
            resenias
        };
    }

    obtenerFavoritos(usuarioId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        return [...usuario.favoritos];
    }

    agregarFavorito(usuarioId, eventoId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            throw new EntidadNoEncontradaError("Evento", eventoId);
        }
        usuario.agregarFavorito(evento);
        this.usuarioRepository.save(usuario);
        return usuario;
    }

    quitarFavorito(usuarioId, eventoId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            throw new EntidadNoEncontradaError("Evento", eventoId);
        }
        usuario.quitarFavorito(evento);
        this.usuarioRepository.save(usuario);
        return usuario;
    }
}

export default UsuarioService;
