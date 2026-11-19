import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearResenia, obtenerResenias } from '@/api/resenias';
import { clavesCompras } from '@/hooks/useCompras';
import { clavesEventos } from '@/hooks/useEventos';
import { clavesUsuarios } from '@/hooks/useUsuarios';

export const clavesResenias = {
  todas: ['resenias'],
  lista: (filtros) => ['resenias', 'lista', filtros],
};

export function useResenias(filtros = {}) {
  return useQuery({
    queryKey: clavesResenias.lista(filtros),
    queryFn: () => obtenerResenias(filtros),
    enabled: Boolean(filtros.eventoId || filtros.organizadorId),
  });
}

export function useCrearResenia() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: crearResenia,
    onSuccess: async (_reseniaCreada, variables) => {
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesResenias.todas }),
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.todas }),
        clienteQuery.invalidateQueries({
          queryKey: clavesCompras.detalle(variables.compraId),
        }),
        clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos }),
        clienteQuery.invalidateQueries({ queryKey: clavesUsuarios.todos }),
      ]);
    },
  });
}
