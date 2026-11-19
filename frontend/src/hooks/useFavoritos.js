import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  agregarFavorito,
  obtenerFavoritosUsuario,
  quitarFavorito,
} from '@/api/usuarios';
import { clavesUsuarios } from '@/hooks/useUsuarios';

export function useFavoritos(usuarioId) {
  return useQuery({
    queryKey: usuarioId
      ? clavesUsuarios.favoritos(usuarioId)
      : ['usuarios', 'ninguno', 'favoritos'],
    queryFn: () => obtenerFavoritosUsuario(usuarioId),
    enabled: Boolean(usuarioId),
  });
}

export function useAlternarFavorito(usuarioId) {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: async ({ evento, esFavorito }) => {
      if (!usuarioId) {
        throw new Error('Debés iniciar sesión para guardar favoritos');
      }
      if (esFavorito) {
        return quitarFavorito(usuarioId, evento.id);
      }
      return agregarFavorito(usuarioId, evento.id);
    },
    onMutate: async ({ evento, esFavorito }) => {
      if (!usuarioId) return {};
      const claveFav = clavesUsuarios.favoritos(usuarioId);
      const claveUsuario = clavesUsuarios.detalle(usuarioId);

      await Promise.all([
        clienteQuery.cancelQueries({ queryKey: claveFav }),
        clienteQuery.cancelQueries({ queryKey: claveUsuario }),
      ]);

      const favoritosPrevios = clienteQuery.getQueryData(claveFav);
      const usuarioPrevio = clienteQuery.getQueryData(claveUsuario);

      if (Array.isArray(favoritosPrevios)) {
        const nuevosFavoritos = esFavorito
          ? favoritosPrevios.filter((item) => item.id !== evento.id)
          : [...favoritosPrevios, evento];
        clienteQuery.setQueryData(claveFav, nuevosFavoritos);
      }

      if (usuarioPrevio && Array.isArray(usuarioPrevio.favoritos)) {
        const nuevosFavUsuario = esFavorito
          ? usuarioPrevio.favoritos.filter((item) => item.id !== evento.id)
          : [...usuarioPrevio.favoritos, evento];
        clienteQuery.setQueryData(claveUsuario, {
          ...usuarioPrevio,
          favoritos: nuevosFavUsuario,
        });
      }

      return { favoritosPrevios, usuarioPrevio };
    },
    onError: (_err, _vars, contexto) => {
      if (!usuarioId || !contexto) return;
      if (contexto.favoritosPrevios) {
        clienteQuery.setQueryData(
          clavesUsuarios.favoritos(usuarioId),
          contexto.favoritosPrevios
        );
      }
      if (contexto.usuarioPrevio) {
        clienteQuery.setQueryData(
          clavesUsuarios.detalle(usuarioId),
          contexto.usuarioPrevio
        );
      }
    },
    onSettled: async () => {
      if (!usuarioId) return;
      await Promise.all([
        clienteQuery.invalidateQueries({ queryKey: clavesUsuarios.favoritos(usuarioId) }),
        clienteQuery.invalidateQueries({ queryKey: clavesUsuarios.detalle(usuarioId) }),
      ]);
    },
  });
}
