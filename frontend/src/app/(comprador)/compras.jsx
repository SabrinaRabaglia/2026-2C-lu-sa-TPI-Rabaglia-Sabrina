import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { InsigniaEstado } from '@/components/InsigniaEstado';
import { PastillaDiasFaltantes } from '@/components/PastillaDiasFaltantes';
import { useSesion } from '@/context/SesionContext';
import { useCompras } from '@/hooks/useCompras';
import { formatearFechaEvento, formatearMoneda } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const PORTADA_POR_DEFECTO =
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=640&q=70&fm=webp';

const PESTANIAS_ESTADO = [
  { id: 'TODAS', etiqueta: 'Todas', coincide: () => true },
  {
    id: 'PENDIENTE',
    etiqueta: 'Pendientes',
    coincide: (e) => e === 'PENDIENTE',
  },
  {
    id: 'CONFIRMADA',
    etiqueta: 'Confirmadas',
    coincide: (e) => e === 'CONFIRMADA',
  },
  {
    id: 'UTILIZADA',
    etiqueta: 'Utilizadas',
    coincide: (e) => e === 'UTILIZADA',
  },
  {
    id: 'CANCELADAS',
    etiqueta: 'Canceladas / Reembolsadas',
    coincide: (e) => e === 'CANCELADA' || e === 'REEMBOLSADA',
  },
];

export default function PantallaMisCompras() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();
  const [pestaniaSeleccionada, setPestaniaSeleccionada] = useState('TODAS');

  const consultaCompras = useCompras({ compradorId: usuarioId });

  const comprasFiltradas = useMemo(() => {
    const crudas = Array.isArray(consultaCompras.data)
      ? consultaCompras.data
      : consultaCompras.data?.items || [];
    const pestania =
      PESTANIAS_ESTADO.find((t) => t.id === pestaniaSeleccionada) ||
      PESTANIAS_ESTADO[0];

    return crudas
      .filter((c) => pestania.coincide(c.estado))
      .sort((a, b) => {
        const tiempoA = new Date(a.evento?.fecha || 0).getTime();
        const tiempoB = new Date(b.evento?.fecha || 0).getTime();
        return tiempoA - tiempoB;
      });
  }, [consultaCompras.data, pestaniaSeleccionada]);

  if (consultaCompras.isLoading) {
    return <EstadoCarga mensaje="Cargando tus compras..." />;
  }

  if (consultaCompras.isError) {
    return (
      <EstadoError
        mensaje={
          consultaCompras.error instanceof Error
            ? consultaCompras.error.message
            : 'No pudimos cargar tus compras'
        }
        alReintentar={() => void consultaCompras.refetch()}
      />
    );
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.encabezadoFiltros}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.filaPestanias}
        >
          {PESTANIAS_ESTADO.map((pestania) => {
            const activa = pestaniaSeleccionada === pestania.id;
            return (
              <Pressable
                key={pestania.id}
                onPress={() => setPestaniaSeleccionada(pestania.id)}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar compras: ${pestania.etiqueta}`}
                accessibilityState={{ selected: activa }}
                style={[
                  estilos.chipPestania,
                  activa && estilos.chipPestaniaActiva,
                ]}
              >
                <Text
                  style={[
                    estilos.textoChipPestania,
                    activa && estilos.textoChipPestaniaActiva,
                  ]}
                >
                  {pestania.etiqueta}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {comprasFiltradas.length === 0 ? (
        <EstadoVacio
          icono="ticket-outline"
          titulo="No tenés compras en esta sección"
          subtitulo="Explorá el catálogo de eventos para adquirir tus próximas entradas."
          etiquetaAccion="Explorar eventos"
          alAccionar={() => enrutador.navigate('/(comprador)')}
        />
      ) : (
        <FlatList
          data={comprasFiltradas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.contenidoLista}
          refreshControl={
            <RefreshControl
              refreshing={consultaCompras.isRefetching}
              onRefresh={() => void consultaCompras.refetch()}
              tintColor={colores.primario}
            />
          }
          renderItem={({ item }) => {
            const portada =
              item.evento?.multimedia?.[0] || PORTADA_POR_DEFECTO;
            const estaConfirmada = item.estado === 'CONFIRMADA';

            return (
              <Pressable
                onPress={() => enrutador.push(`/compra/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ver compra de ${item.evento?.nombre}`}
                style={({ pressed }) => [
                  estilos.tarjetaCompra,
                  pressed && estilos.tarjetaCompraPresionada,
                ]}
              >
                <Image
                  source={{ uri: portada }}
                  alt={`Portada de ${item.evento?.nombre || 'evento'}`}
                  accessibilityLabel={`Portada de ${item.evento?.nombre || 'evento'}`}
                  style={estilos.miniatura}
                  contentFit="cover"
                />

                <View style={estilos.cuerpoTarjeta}>
                  <View style={estilos.filaInsignias}>
                    <InsigniaEstado estado={item.estado} />
                    {estaConfirmada ? (
                      <PastillaDiasFaltantes
                        fechaEvento={item.evento?.fecha}
                        diasDesdeBackend={item.diasFaltantesParaEvento}
                      />
                    ) : null}
                    {item.puedeSerReseniada ? (
                      <View style={estilos.pastillaCalificar}>
                        <Ionicons
                          name="star"
                          size={12}
                          color={colores.estrella}
                        />
                        <Text style={estilos.textoPastillaCalificar}>
                          Lista para calificar
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={estilos.tituloEvento} numberOfLines={1}>
                    {item.evento?.nombre || 'Evento'}
                  </Text>
                  <Text style={estilos.fechaEvento}>
                    {formatearFechaEvento(item.evento?.fecha)}
                  </Text>

                  <View style={estilos.filaInferior}>
                    <Text style={estilos.infoEntrada}>
                      {item.tipoEntrada?.nombre} × {item.cantidad}
                    </Text>
                    <Text style={estilos.textoTotal}>
                      {formatearMoneda(item.total)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezadoFiltros: {
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingVertical: espaciado.sm,
  },
  filaPestanias: {
    paddingHorizontal: espaciado.lg,
    gap: espaciado.sm,
  },
  chipPestania: {
    minHeight: 38,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPestaniaActiva: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChipPestania: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoChipPestaniaActiva: {
    color: colores.textoPrimario,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  tarjetaCompra: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    overflow: 'hidden',
    ...sombras.tarjeta,
  },
  tarjetaCompraPresionada: {
    opacity: 0.9,
  },
  miniatura: {
    width: 96,
    height: '100%',
    minHeight: 120,
    backgroundColor: colores.borde,
  },
  cuerpoTarjeta: {
    flex: 1,
    padding: espaciado.md,
    gap: 4,
    justifyContent: 'space-between',
  },
  filaInsignias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espaciado.xs,
    marginBottom: 2,
  },
  pastillaCalificar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colores.advertenciaFondo,
    paddingHorizontal: espaciado.sm + 2,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoPastillaCalificar: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.advertencia,
  },
  tituloEvento: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  fechaEvento: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    textTransform: 'capitalize',
  },
  filaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espaciado.xs,
  },
  infoEntrada: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoTotal: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
});
