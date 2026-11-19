import { useQuery } from '@tanstack/react-query';
import { obtenerUsuarioPorId, obtenerUsuarios } from '@/api/usuarios';

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
