import { peticionApi } from '@/api/cliente';

export function obtenerEventos(parametros = {}) {
  return peticionApi('/eventos', {
    consulta: parametros,
  });
}

export function obtenerEventoPorId(eventoId) {
  return peticionApi(`/eventos/${eventoId}`);
}

export function crearEvento(datos) {
  return peticionApi('/eventos', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

export function obtenerVentasEvento(eventoId, organizadorId) {
  return peticionApi(`/eventos/${eventoId}/compras`, {
    consulta: organizadorId ? { organizadorId } : undefined,
  });
}
