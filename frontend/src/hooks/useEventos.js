import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  crearEvento,
  obtenerEventoPorId,
  obtenerEventos,
  obtenerVentasEvento,
} from '@/api/eventos';

export const clavesEventos = {
  todos: ['eventos'],
  lista: (filtros) => ['eventos', 'lista', filtros],
  detalle: (eventoId) => ['eventos', 'detalle', eventoId],
  ventas: (eventoId, organizadorId) => [
    'eventos',
    'ventas',
    eventoId,
    organizadorId ?? 'todos',
  ],
};

export function useEventos(filtros = {}) {
  return useQuery({
    queryKey: clavesEventos.lista(filtros),
    queryFn: () => obtenerEventos(filtros),
  });
}

export function useEvento(eventoId) {
  return useQuery({
    queryKey: eventoId ? clavesEventos.detalle(eventoId) : ['eventos', 'detalle', 'ninguno'],
    queryFn: () => obtenerEventoPorId(eventoId),
    enabled: Boolean(eventoId),
  });
}

export function useVentasEvento(eventoId, organizadorId) {
  return useQuery({
    queryKey: eventoId
      ? clavesEventos.ventas(eventoId, organizadorId)
      : ['eventos', 'ventas', 'ninguno'],
    queryFn: () => obtenerVentasEvento(eventoId, organizadorId),
    enabled: Boolean(eventoId),
  });
}

export function useCrearEvento() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: crearEvento,
    onSuccess: async () => {
      await clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos });
    },
  });
}
