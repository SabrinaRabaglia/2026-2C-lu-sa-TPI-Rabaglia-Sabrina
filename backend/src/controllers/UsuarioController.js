import { usuarioService as defaultUsuarioService } from "../services/index.js";

export class UsuarioController {
    constructor({ usuarioService = defaultUsuarioService } = {}) {
        this.usuarioService = usuarioService;
    }

    listar = (req, res) => {
        const usuarios = this.usuarioService.listarUsuarios();
        res.status(200).json(usuarios);
    };

    obtenerPorId = (req, res) => {
        const usuario = this.usuarioService.obtenerUsuarioPorId(req.params.id);
        res.status(200).json(usuario);
    };

    crear = (req, res) => {
        const nuevoUsuario = this.usuarioService.crearUsuario(req.body);
        res.status(201).json(nuevoUsuario);
    };

    listarFavoritos = (req, res) => {
        const favoritos = this.usuarioService.obtenerFavoritos(req.params.id);
        res.status(200).json(favoritos);
    };

    agregarFavorito = (req, res) => {
        const usuario = this.usuarioService.agregarFavorito(req.params.id, req.body.eventoId);
        res.status(201).json(usuario);
    };

    quitarFavorito = (req, res) => {
        const usuario = this.usuarioService.quitarFavorito(req.params.id, req.params.eventoId);
        res.status(200).json(usuario);
    };
}

export default UsuarioController;
