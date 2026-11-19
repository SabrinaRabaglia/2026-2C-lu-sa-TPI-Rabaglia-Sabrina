import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { useSesion } from '@/context/SesionContext';
import { useUsuarios } from '@/hooks/useUsuarios';
import { obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

export default function PantallaLogin() {
  const enrutador = useRouter();
  const { iniciarSesion } = useSesion();
  const {
    data: usuarios,
    isLoading: cargando,
    isError: hayError,
    error,
    refetch: recargar,
  } = useUsuarios();
  const [modoSeleccionado, setModoSeleccionado] = useState('COMPRADOR');

  const manejarSeleccionUsuario = async (usuario) => {
    await iniciarSesion(usuario.id, modoSeleccionado);
    enrutador.replace(
      modoSeleccionado === 'COMPRADOR' ? '/(comprador)' : '/(organizador)'
    );
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.encabezado}>
        <View style={estilos.insigniaLogo}>
          <Ionicons name="ticket" size={28} color={colores.textoPrimario} />
        </View>
        <Text style={estilos.titulo}>AI Ticket It</Text>
        <Text style={estilos.subtitulo}>
          Elegí un usuario y el modo con el que querés ingresar
        </Text>

        {/* Selector de rol contextual: cualquier usuario puede operar como comprador u organizador */}
        <View style={estilos.selectorModo}>
          <Pressable
            onPress={() => setModoSeleccionado('COMPRADOR')}
            accessibilityRole="button"
            accessibilityLabel="Ingresar como Comprador"
            accessibilityState={{ selected: modoSeleccionado === 'COMPRADOR' }}
            style={[
              estilos.opcionModo,
              modoSeleccionado === 'COMPRADOR' && estilos.opcionModoActiva,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={
                modoSeleccionado === 'COMPRADOR'
                  ? colores.textoPrimario
                  : colores.textoSecundario
              }
            />
            <Text
              style={[
                estilos.textoOpcionModo,
                modoSeleccionado === 'COMPRADOR' && estilos.textoOpcionModoActiva,
              ]}
            >
              Comprador
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setModoSeleccionado('ORGANIZADOR')}
            accessibilityRole="button"
            accessibilityLabel="Ingresar como Organizador"
            accessibilityState={{
              selected: modoSeleccionado === 'ORGANIZADOR',
            }}
            style={[
              estilos.opcionModo,
              modoSeleccionado === 'ORGANIZADOR' && estilos.opcionModoActiva,
            ]}
          >
            <Ionicons
              name="megaphone-outline"
              size={18}
              color={
                modoSeleccionado === 'ORGANIZADOR'
                  ? colores.textoPrimario
                  : colores.textoSecundario
              }
            />
            <Text
              style={[
                estilos.textoOpcionModo,
                modoSeleccionado === 'ORGANIZADOR' &&
                  estilos.textoOpcionModoActiva,
              ]}
            >
              Organizador
            </Text>
          </Pressable>
        </View>
      </View>

      {cargando ? (
        <EstadoCarga mensaje="Conectando con el servidor..." />
      ) : hayError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'No pudimos cargar los usuarios'
          }
          alReintentar={() => void recargar()}
        />
      ) : !usuarios || usuarios.length === 0 ? (
        <EstadoVacio
          icono="people-outline"
          titulo="No hay usuarios disponibles"
          subtitulo="Verificá que el backend esté iniciado con los datos semilla."
          etiquetaAccion="Reintentar"
          alAccionar={() => void recargar()}
        />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.contenidoLista}
          ListHeaderComponent={
            <Text style={estilos.encabezadoLista}>Usuarios disponibles</Text>
          }
          renderItem={({ item }) => {
            const iniciales = `${item.nombre.charAt(0)}${item.apellido.charAt(0)}`.toUpperCase();
            return (
              <Pressable
                onPress={() => void manejarSeleccionUsuario(item)}
                accessibilityRole="button"
                accessibilityLabel={`Ingresar como ${obtenerNombreCompleto(item)}`}
                style={({ pressed }) => [
                  estilos.tarjetaUsuario,
                  pressed && estilos.tarjetaUsuarioPresionada,
                ]}
              >
                <View style={estilos.avatar}>
                  <Text style={estilos.textoAvatar}>{iniciales}</Text>
                </View>
                <View style={estilos.infoUsuario}>
                  <Text style={estilos.nombreUsuario}>
                    {obtenerNombreCompleto(item)}
                  </Text>
                  <Text style={estilos.ayudaUsuario}>
                    {modoSeleccionado === 'COMPRADOR'
                      ? 'Explorar eventos y comprar entradas'
                      : 'Publicar eventos y ver ventas'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colores.textoSecundario}
                />
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    paddingHorizontal: espaciado.lg,
    paddingTop: espaciado.xl,
    paddingBottom: espaciado.lg,
    alignItems: 'center',
    gap: espaciado.sm,
  },
  insigniaLogo: {
    width: 56,
    height: 56,
    borderRadius: bordes.lg,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: '700',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  selectorModo: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderRadius: bordes.md,
    padding: espaciado.xs,
    borderWidth: 1,
    borderColor: colores.borde,
    marginTop: espaciado.md,
    width: '100%',
  },
  opcionModo: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    borderRadius: bordes.sm,
  },
  opcionModoActiva: {
    backgroundColor: colores.primario,
  },
  textoOpcionModo: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoOpcionModoActiva: {
    color: colores.textoPrimario,
  },
  contenidoLista: {
    paddingHorizontal: espaciado.lg,
    paddingBottom: espaciado.xl,
    gap: espaciado.md,
  },
  encabezadoLista: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
    marginBottom: espaciado.xs,
  },
  tarjetaUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    minHeight: 72,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  tarjetaUsuarioPresionada: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatar: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
  infoUsuario: {
    flex: 1,
    gap: 2,
  },
  nombreUsuario: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  ayudaUsuario: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
});
