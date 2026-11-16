import { Usuario } from "../models/index.js";
import {
    usuarioRepository as defaultUsuarioRepo,
    eventoRepository as defaultEventoRepo
} from "../repositories/index.js";

export class UsuarioService {
    constructor({
        usuarioRepository = defaultUsuarioRepo,
        eventoRepository = defaultEventoRepo
    } = {}) {
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
    }

    listarUsuarios() {
        return this.usuarioRepository.findAll();
    }

    obtenerUsuarioPorId(id) {
        const usuario = this.usuarioRepository.findById(id);
        if (!usuario) {
            const error = new Error(`Usuario con id "${id}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        return usuario;
    }

    crearUsuario({ nombre, apellido }) {
        const usuario = new Usuario({ nombre, apellido });
        return this.usuarioRepository.save(usuario);
    }

    obtenerFavoritos(usuarioId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        return [...usuario.favoritos];
    }

    agregarFavorito(usuarioId, eventoId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        usuario.agregarFavorito(evento);
        this.usuarioRepository.save(usuario);
        return usuario;
    }

    quitarFavorito(usuarioId, eventoId) {
        const usuario = this.obtenerUsuarioPorId(usuarioId);
        const evento = this.eventoRepository.findById(eventoId);
        if (!evento) {
            const error = new Error(`Evento con id "${eventoId}" no encontrado`);
            error.statusCode = 404;
            throw error;
        }
        usuario.quitarFavorito(evento);
        this.usuarioRepository.save(usuario);
        return usuario;
    }
}

export default UsuarioService;
