import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useUsuario } from '@/hooks/useUsuarios';

const CLAVE_STORAGE_USUARIO_ID = '@ai_ticket_it:usuario_id';
const CLAVE_STORAGE_MODO = '@ai_ticket_it:modo_app';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const clienteQuery = useQueryClient();
  const [usuarioId, setUsuarioId] = useState(null);
  const [modo, setModoEstado] = useState('COMPRADOR');
  const [hidratado, setHidratado] = useState(false);

  // Solo leemos el id de sesión local y el modo activo (nunca datos de negocio).
  useEffect(() => {
    let activo = true;
    async function hidratarSesion() {
      try {
        const [idGuardado, modoGuardado] = await Promise.all([
          AsyncStorage.getItem(CLAVE_STORAGE_USUARIO_ID),
          AsyncStorage.getItem(CLAVE_STORAGE_MODO),
        ]);
        if (!activo) return;
        if (idGuardado) {
          setUsuarioId(idGuardado);
        }
        if (modoGuardado === 'COMPRADOR' || modoGuardado === 'ORGANIZADOR') {
          setModoEstado(modoGuardado);
        }
      } finally {
        if (activo) {
          setHidratado(true);
        }
      }
    }
    void hidratarSesion();
    return () => {
      activo = false;
    };
  }, []);

  const consultaUsuario = useUsuario(usuarioId);

  // Si el servidor reinició o el usuario guardado ya no existe (404), cerramos sesión limpia.
  useEffect(() => {
    if (usuarioId && consultaUsuario.isError) {
      setUsuarioId(null);
      void AsyncStorage.removeItem(CLAVE_STORAGE_USUARIO_ID);
    }
  }, [usuarioId, consultaUsuario.isError]);

  const iniciarSesion = useCallback(async (nuevoUsuarioId, nuevoModo) => {
    setUsuarioId(nuevoUsuarioId);
    setModoEstado(nuevoModo);
    await Promise.all([
      AsyncStorage.setItem(CLAVE_STORAGE_USUARIO_ID, nuevoUsuarioId),
      AsyncStorage.setItem(CLAVE_STORAGE_MODO, nuevoModo),
    ]);
  }, []);

  const cambiarModo = useCallback(async (nuevoModo) => {
    setModoEstado(nuevoModo);
    await AsyncStorage.setItem(CLAVE_STORAGE_MODO, nuevoModo);
  }, []);

  const cerrarSesion = useCallback(async () => {
    setUsuarioId(null);
    await AsyncStorage.removeItem(CLAVE_STORAGE_USUARIO_ID);
    clienteQuery.clear();
  }, [clienteQuery]);

  const valor = useMemo(
    () => ({
      usuarioId,
      usuario: consultaUsuario.data ?? null,
      modo,
      hidratado,
      cargandoUsuario: Boolean(usuarioId) && consultaUsuario.isLoading,
      iniciarSesion,
      cambiarModo,
      cerrarSesion,
    }),
    [
      usuarioId,
      consultaUsuario.data,
      consultaUsuario.isLoading,
      modo,
      hidratado,
      iniciarSesion,
      cambiarModo,
      cerrarSesion,
    ]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error('useSesion debe utilizarse dentro de SesionProvider');
  }
  return contexto;
}
