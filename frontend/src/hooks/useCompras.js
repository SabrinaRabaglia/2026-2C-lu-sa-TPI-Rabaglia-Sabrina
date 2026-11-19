import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarEstadoCompra,
  cancelarCompra,
  crearCompra,
  enviarMensajeCompra,
  obtenerCompraPorId,
  obtenerCompras,
  obtenerMensajesCompra,
} from '@/api/compras';
import { clavesEventos } from '@/hooks/useEventos';

export const clavesCompras = {
  todas: ['compras'],
  lista: (filtros) => ['compras', 'lista', filtros],
  detalle: (compraId) => ['compras', 'detalle', compraId],
  mensajes: (compraId) => ['compras', 'mensajes', compraId],
};

export function useCompras(filtros = {}) {
  return useQuery({
    queryKey: clavesCompras.lista(filtros),
    queryFn: () => obtenerCompras(filtros),
    enabled: Boolean(filtros.compradorId || filtros.eventoId),
  });
}

export function useCompra(compraId) {
  return useQuery({
    queryKey: compraId
      ? clavesCompras.detalle(compraId)
      : ['compras', 'detalle', 'ninguna'],
    queryFn: () => obtenerCompraPorId(compraId),
    enabled: Boolean(compraId),
  });
}

export function useCrearCompra() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: crearCompra,
    onSuccess: async (nuevaCompra) => {
      const eventoId = nuevaCompra?.evento?.id;
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.todas }),
        clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos }),
        eventoId
          ? clienteQuery.invalidateQueries({ queryKey: clavesEventos.detalle(eventoId) })
          : Promise.resolve(),
      ]);
    },
  });
}

export function usePagarCompra() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ compraId, usuarioId }) =>
      actualizarEstadoCompra(compraId, { estado: 'CONFIRMADA', usuarioId }),
    onSuccess: async (compraActualizada) => {
      const eventoId = compraActualizada?.evento?.id;
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.todas }),
        clienteQuery.invalidateQueries({
          queryKey: clavesCompras.detalle(compraActualizada.id),
        }),
        clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos }),
        eventoId
          ? clienteQuery.invalidateQueries({ queryKey: clavesEventos.detalle(eventoId) })
          : Promise.resolve(),
      ]);
    },
  });
}

export function useMarcarCompraUtilizada() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ compraId, usuarioId }) =>
      actualizarEstadoCompra(compraId, { estado: 'UTILIZADA', usuarioId }),
    onSuccess: async (compraActualizada) => {
      const eventoId = compraActualizada?.evento?.id;
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.todas }),
        clienteQuery.invalidateQueries({
          queryKey: clavesCompras.detalle(compraActualizada.id),
        }),
        clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos }),
        eventoId
          ? clienteQuery.invalidateQueries({ queryKey: clavesEventos.detalle(eventoId) })
          : Promise.resolve(),
      ]);
    },
  });
}

export function useCancelarCompra() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ compraId, usuarioId }) => cancelarCompra(compraId, usuarioId),
    onSuccess: async (compraCancelada) => {
      const eventoId = compraCancelada?.evento?.id;
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.todas }),
        clienteQuery.invalidateQueries({
          queryKey: clavesCompras.detalle(compraCancelada.id),
        }),
        clienteQuery.invalidateQueries({ queryKey: clavesEventos.todos }),
        eventoId
          ? clienteQuery.invalidateQueries({ queryKey: clavesEventos.detalle(eventoId) })
          : Promise.resolve(),
      ]);
    },
  });
}

export function useMensajesCompra(compraId, pantallaEnfocada = true) {
  return useQuery({
    queryKey: compraId
      ? clavesCompras.mensajes(compraId)
      : ['compras', 'mensajes', 'ninguna'],
    queryFn: () => obtenerMensajesCompra(compraId),
    enabled: Boolean(compraId),
    refetchInterval: pantallaEnfocada ? 5000 : false,
  });
}

export function useEnviarMensaje(compraId) {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ usuario, mensaje }) =>
      enviarMensajeCompra(compraId, {
        usuarioId: usuario.id,
        mensaje,
      }),
    onMutate: async ({ usuario, mensaje }) => {
      const claveMensajes = clavesCompras.mensajes(compraId);
      await clienteQuery.cancelQueries({ queryKey: claveMensajes });

      const mensajesPrevios = clienteQuery.getQueryData(claveMensajes);
      const mensajeOptimista = {
        id: `temp-${Date.now()}`,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
        },
        mensaje,
        enviado: new Date().toISOString(),
      };

      clienteQuery.setQueryData(claveMensajes, (anteriores) =>
        Array.isArray(anteriores)
          ? [...anteriores, mensajeOptimista]
          : [mensajeOptimista]
      );

      return { mensajesPrevios };
    },
    onError: (_err, _vars, contexto) => {
      if (contexto?.mensajesPrevios) {
        clienteQuery.setQueryData(
          clavesCompras.mensajes(compraId),
          contexto.mensajesPrevios
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.mensajes(compraId) }),
        clienteQuery.invalidateQueries({ queryKey: clavesCompras.detalle(compraId) }),
      ]);
    },
  });
}
