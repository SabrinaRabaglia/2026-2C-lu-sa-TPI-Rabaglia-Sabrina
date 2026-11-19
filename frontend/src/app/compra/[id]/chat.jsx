import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BurbujaMensaje } from '@/components/BurbujaMensaje';
import { EntradaChat } from '@/components/EntradaChat';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { useSesion } from '@/context/SesionContext';
import {
  useCompra,
  useEnviarMensaje,
  useMensajesCompra,
} from '@/hooks/useCompras';
import { colores, espaciado, tipografia } from '@/tema';

export default function PantallaChatCompra() {
  const { id } = useLocalSearchParams();
  const { usuario, usuarioId } = useSesion();
  const [pantallaEnfocada, setPantallaEnfocada] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setPantallaEnfocada(true);
      return () => setPantallaEnfocada(false);
    }, [])
  );

  const consultaCompra = useCompra(id);
  const consultaMensajes = useMensajesCompra(id, pantallaEnfocada);
  const mutacionEnviarMensaje = useEnviarMensaje(id);

  const mensajesInvertidos = useMemo(() => {
    const lista = consultaMensajes.data || [];
    return [...lista].reverse();
  }, [consultaMensajes.data]);

  if (consultaMensajes.isLoading || consultaCompra.isLoading) {
    return <EstadoCarga mensaje="Abriendo conversación..." />;
  }

  if (consultaMensajes.isError) {
    return (
      <EstadoError
        mensaje={
          consultaMensajes.error instanceof Error
            ? consultaMensajes.error.message
            : 'No pudimos cargar los mensajes'
        }
        alReintentar={() => void consultaMensajes.refetch()}
      />
    );
  }

  const compra = consultaCompra.data;
  const organizadorId = compra?.evento?.organizador?.id;

  const manejarEnvio = async (texto) => {
    if (!usuario) return;
    try {
      await mutacionEnviarMensaje.mutateAsync({
        usuario,
        mensaje: texto,
      });
    } catch (err) {
      Alert.alert(
        'No se pudo enviar el mensaje',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 92 : 0}
    >
      {compra ? (
        <View style={estilos.bannerContexto}>
          <Text style={estilos.tituloContexto} numberOfLines={1}>
            {compra.evento?.nombre}
          </Text>
          <Text style={estilos.subtituloContexto}>
            Espacio de consultas entre comprador y organizador
          </Text>
        </View>
      ) : null}

      {mensajesInvertidos.length === 0 ? (
        <EstadoVacio
          icono="chatbubbles-outline"
          titulo="Todavía no hay mensajes"
          subtitulo="Escribí tu consulta sobre el evento, el ingreso o los horarios."
        />
      ) : (
        <FlatList
          data={mensajesInvertidos}
          inverted
          keyExtractor={(item, indice) => item.id || `msg-${indice}`}
          contentContainerStyle={estilos.contenidoLista}
          renderItem={({ item }) => (
            <BurbujaMensaje
              mensaje={item}
              esPropio={Boolean(usuarioId && item.usuario?.id === usuarioId)}
              organizadorId={organizadorId}
            />
          )}
        />
      )}

      <EntradaChat alEnviar={manejarEnvio} />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  bannerContexto: {
    backgroundColor: colores.superficie,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  tituloContexto: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  subtituloContexto: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  contenidoLista: {
    paddingVertical: espaciado.md,
  },
});
