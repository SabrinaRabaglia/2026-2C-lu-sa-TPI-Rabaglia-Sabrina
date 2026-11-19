import { peticionApi } from '@/api/cliente';

export function obtenerResenias(parametros = {}) {
  return peticionApi('/resenias', {
    consulta: parametros,
  });
}

export function crearResenia({ compraId, compradorId, puntuacion, detalle }) {
  return peticionApi('/resenias', {
    metodo: 'POST',
    cuerpo: {
      compraId,
      compradorId,
      puntuacion,
      detalle,
    },
  });
}
