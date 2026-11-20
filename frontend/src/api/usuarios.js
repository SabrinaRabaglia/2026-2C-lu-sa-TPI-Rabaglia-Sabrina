import { peticionApi } from '@/api/cliente';

export function obtenerUsuarios() {
  return peticionApi('/usuarios');
}

export function registrarUsuario(datos) {
  return peticionApi('/usuarios/registro', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function loginUsuario({ email, password }) {
  return peticionApi('/usuarios/login', {
    metodo: 'POST',
    cuerpo: { email, password },
  });
}

export function obtenerUsuarioPorId(usuarioId) {
  return peticionApi(`/usuarios/${usuarioId}`);
}

export function obtenerFavoritosUsuario(usuarioId) {
  return peticionApi(`/usuarios/${usuarioId}/favoritos`);
}

export function agregarFavorito(usuarioId, eventoId) {
  return peticionApi(`/usuarios/${usuarioId}/favoritos`, {
    metodo: 'POST',
    cuerpo: { eventoId },
  });
}

export function quitarFavorito(usuarioId, eventoId) {
  return peticionApi(`/usuarios/${usuarioId}/favoritos/${eventoId}`, {
    metodo: 'DELETE',
  });
}

export function obtenerReputacionOrganizador(usuarioId) {
  return peticionApi(`/usuarios/${usuarioId}/reputacion`);
}

export function restaurarDatosSemilla() {
  return peticionApi('/seed', { metodo: 'POST' });
}
