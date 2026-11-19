import { useQuery } from '@tanstack/react-query';
import { obtenerCategorias } from '@/api/categorias';

export const clavesCategorias = {
  todas: ['categorias'],
};

export function useCategorias() {
  return useQuery({
    queryKey: clavesCategorias.todas,
    queryFn: obtenerCategorias,
  });
}
