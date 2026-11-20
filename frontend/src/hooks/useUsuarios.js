import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loginUsuario,
  obtenerUsuarioPorId,
  obtenerUsuarios,
  registrarUsuario,
} from '@/api/usuarios';

export const clavesUsuarios = {
  todos: ['usuarios'],
  detalle: (usuarioId) => ['usuarios', usuarioId],
  favoritos: (usuarioId) => ['usuarios', usuarioId, 'favoritos'],
  reputacion: (usuarioId) => ['usuarios', usuarioId, 'reputacion'],
};

export function useUsuarios() {
  return useQuery({
    queryKey: clavesUsuarios.todos,
    queryFn: obtenerUsuarios,
  });
}

export function useUsuario(usuarioId) {
  return useQuery({
    queryKey: usuarioId ? clavesUsuarios.detalle(usuarioId) : ['usuarios', 'anonimo'],
    queryFn: () => obtenerUsuarioPorId(usuarioId),
    enabled: Boolean(usuarioId),
  });
}

export function useLoginUsuario() {
  return useMutation({
    mutationFn: loginUsuario,
  });
}

export function useRegistrarUsuario() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: registrarUsuario,
    onSuccess: async () => {
      await clienteQuery.invalidateQueries({ queryKey: clavesUsuarios.todos });
    },
  });
}
