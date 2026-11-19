import { peticionApi } from '@/api/cliente';

export function obtenerCategorias() {
  return peticionApi('/categorias');
}

export function crearCategoria(datos) {
  return peticionApi('/categorias', {
    metodo: 'POST',
    cuerpo: datos,
  });
}
