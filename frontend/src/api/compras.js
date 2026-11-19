import { peticionApi } from '@/api/cliente';

export function obtenerCompras(parametros = {}) {
  return peticionApi('/compras', {
    consulta: parametros,
  });
}

export function obtenerCompraPorId(compraId) {
  return peticionApi(`/compras/${compraId}`);
}

export function crearCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
  return peticionApi('/compras', {
    metodo: 'POST',
    cuerpo: {
      compradorId,
      eventoId,
      tipoEntradaId,
      cantidad,
      estadoInicial: 'PENDIENTE',
    },
  });
}

export function actualizarEstadoCompra(compraId, { estado, usuarioId }) {
  return peticionApi(`/compras/${compraId}`, {
    metodo: 'PATCH',
    cuerpo: { estado, usuarioId },
  });
}

export function cancelarCompra(compraId, usuarioId) {
  return peticionApi(`/compras/${compraId}`, {
    metodo: 'DELETE',
    cuerpo: usuarioId ? { usuarioId } : undefined,
  });
}

export function obtenerMensajesCompra(compraId) {
  return peticionApi(`/compras/${compraId}/mensajes`);
}

export function enviarMensajeCompra(compraId, { usuarioId, mensaje }) {
  return peticionApi(`/compras/${compraId}/mensajes`, {
    metodo: 'POST',
    cuerpo: { usuarioId, mensaje },
  });
}
