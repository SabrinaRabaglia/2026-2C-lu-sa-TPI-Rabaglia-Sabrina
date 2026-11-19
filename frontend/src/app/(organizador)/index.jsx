import React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { useSesion } from '@/context/SesionContext';
import { useEventos } from '@/hooks/useEventos';
import { formatearFechaEvento, formatearMoneda } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const PORTADA_POR_DEFECTO =
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80';

export default function PantallaEventosOrganizador() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const consultaEventos = useEventos({ organizadorId: usuarioId });

  if (consultaEventos.isLoading) {
    return <EstadoCarga mensaje="Cargando tus eventos publicados..." />;
  }

  if (consultaEventos.isError) {
    return (
      <EstadoError
        mensaje={
          consultaEventos.error instanceof Error
            ? consultaEventos.error.message
            : 'No pudimos cargar tus eventos'
        }
        alReintentar={() => void consultaEventos.refetch()}
      />
    );
  }

  const eventos = Array.isArray(consultaEventos.data)
    ? consultaEventos.data
    : consultaEventos.data?.items || [];

  if (eventos.length === 0) {
    return (
      <EstadoVacio
        icono="calendar-outline"
        titulo="Todavía no publicaste ningún evento"
        subtitulo="Creá tu primer espectáculo configurando los tipos de entrada, precios y cupos."
        etiquetaAccion="Crear mi primer evento"
        alAccionar={() => enrutador.navigate('/(organizador)/crear')}
      />
    );
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.contenidoLista}
        refreshControl={
          <RefreshControl
            refreshing={consultaEventos.isRefetching}
            onRefresh={() => void consultaEventos.refetch()}
            tintColor={colores.primario}
          />
        }
        renderItem={({ item }) => {
          const portada = item.multimedia?.[0] || PORTADA_POR_DEFECTO;
          const finalizado = new Date(item.fecha).getTime() <= Date.now();
          const cupoDisponible =
            typeof item.cupoTotalDisponible === 'number'
              ? item.cupoTotalDisponible
              : (item.tiposEntrada || []).reduce((acc, t) => acc + t.cupo, 0);

          return (
            <View style={estilos.tarjeta}>
              <Pressable
                onPress={() => enrutador.push(`/evento/${item.id}/ventas`)}
                accessibilityRole="button"
                accessibilityLabel={`Ver ventas de ${item.nombre}`}
                style={estilos.seccionSuperior}
              >
                <Image
                  source={{ uri: portada }}
                  style={estilos.miniatura}
                  contentFit="cover"
                />
                <View style={estilos.columnaInfo}>
                  <View style={estilos.filaEtiquetas}>
                    <Text style={estilos.etiquetaCategoria}>
                      {item.categoria?.nombre || 'Evento'}
                    </Text>
                    {finalizado ? (
                      <Text style={estilos.etiquetaFinalizado}>Finalizado</Text>
                    ) : null}
                  </View>

                  <Text style={estilos.titulo} numberOfLines={2}>
                    {item.nombre}
                  </Text>
                  <Text style={estilos.textoFecha}>
                    {formatearFechaEvento(item.fecha)}
                  </Text>

                  <View style={estilos.filaEstadisticas}>
                    <View style={estilos.insigniaEstadistica}>
                      <Ionicons
                        name="ticket-outline"
                        size={14}
                        color={colores.primario}
                      />
                      <Text style={estilos.textoEstadistica}>
                        {cupoDisponible} disponibles
                      </Text>
                    </View>
                    <Text style={estilos.textoPrecio}>
                      Desde {formatearMoneda(item.precioMinimo)}
                    </Text>
                  </View>
                </View>
              </Pressable>

              <View style={estilos.filaAcciones}>
                <BotonPrimario
                  etiqueta="Ver detalle"
                  variante="fantasma"
                  alPresionar={() => enrutador.push(`/evento/${item.id}`)}
                  estilo={estilos.botonAccion}
                />
                <BotonPrimario
                  etiqueta="Ventas y cupos"
                  alPresionar={() =>
                    enrutador.push(`/evento/${item.id}/ventas`)
                  }
                  estilo={estilos.botonAccion}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.md,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  seccionSuperior: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  miniatura: {
    width: 92,
    height: 92,
    borderRadius: bordes.md,
    backgroundColor: colores.borde,
  },
  columnaInfo: {
    flex: 1,
    gap: 4,
  },
  filaEtiquetas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  etiquetaCategoria: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
  },
  etiquetaFinalizado: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  titulo: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  textoFecha: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    textTransform: 'capitalize',
  },
  filaEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  insigniaEstadistica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoEstadistica: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoPrecio: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
  },
  filaAcciones: {
    flexDirection: 'row',
    gap: espaciado.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingTop: espaciado.sm,
  },
  botonAccion: {
    flex: 1,
  },
});
