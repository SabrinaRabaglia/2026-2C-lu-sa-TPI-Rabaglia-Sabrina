import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarraCupo } from '@/components/BarraCupo';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { InsigniaEstado } from '@/components/InsigniaEstado';
import { useSesion } from '@/context/SesionContext';
import { useMarcarCompraUtilizada } from '@/hooks/useCompras';
import { useVentasEvento } from '@/hooks/useEventos';
import { CONFIG_ESTADO_COMPRA } from '@/lib/estadoCompra';
import { formatearMoneda, obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const CLAVES_ESTADO = [
  'PENDIENTE',
  'CONFIRMADA',
  'UTILIZADA',
  'CANCELADA',
  'REEMBOLSADA',
];

export default function PantallaVentasEvento() {
  const { id } = useLocalSearchParams();
  const enrutador = useRouter();
  const { usuarioId } = useSesion();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('TODAS');

  const consultaVentas = useVentasEvento(id, usuarioId);
  const mutacionMarcarUtilizada = useMarcarCompraUtilizada();

  const datosVentas = consultaVentas.data;

  const vendidasPorTipoEntrada = useMemo(() => {
    const mapa = {};
    const compras = datosVentas?.compras || [];
    for (const c of compras) {
      if (
        c.estado === 'PENDIENTE' ||
        c.estado === 'CONFIRMADA' ||
        c.estado === 'UTILIZADA'
      ) {
        const tipoId = c.tipoEntrada?.id;
        if (tipoId) {
          mapa[tipoId] = (mapa[tipoId] || 0) + (c.cantidad || 0);
        }
      }
    }
    return mapa;
  }, [datosVentas?.compras]);

  const comprasFiltradas = useMemo(() => {
    const todas = datosVentas?.compras || [];
    if (estadoSeleccionado === 'TODAS') return todas;
    return todas.filter((c) => c.estado === estadoSeleccionado);
  }, [datosVentas?.compras, estadoSeleccionado]);

  if (consultaVentas.isLoading) {
    return <EstadoCarga mensaje="Cargando ventas y disponibilidad..." />;
  }

  if (consultaVentas.isError || !datosVentas) {
    return (
      <EstadoError
        mensaje={
          consultaVentas.error instanceof Error
            ? consultaVentas.error.message
            : 'No pudimos cargar las ventas del evento'
        }
        alReintentar={() => void consultaVentas.refetch()}
      />
    );
  }

  const metricas = datosVentas.metricas;
  const totalCompras = datosVentas.compras?.length || 0;

  const manejarCheckIn = async (compraId) => {
    try {
      await mutacionMarcarUtilizada.mutateAsync({
        compraId,
        usuarioId,
      });
      await consultaVentas.refetch();
    } catch (err) {
      Alert.alert(
        'No se pudo marcar como utilizada',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenidoLista}
      data={comprasFiltradas}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={consultaVentas.isRefetching}
          onRefresh={() => void consultaVentas.refetch()}
          tintColor={colores.primario}
        />
      }
      ListHeaderComponent={
        <View style={estilos.bloqueEncabezado}>
          <Text style={estilos.tituloEvento}>{datosVentas.nombreEvento}</Text>

          {metricas ? (
            <View style={estilos.filaMetricas}>
              <View style={estilos.tarjetaMetrica}>
                <Text style={estilos.etiquetaMetrica}>Recaudación</Text>
                <Text style={estilos.valorMetrica}>
                  {formatearMoneda(metricas.recaudacionTotal)}
                </Text>
              </View>
              <View style={estilos.tarjetaMetrica}>
                <Text style={estilos.etiquetaMetrica}>Vendidas / Total</Text>
                <Text style={estilos.valorMetrica}>
                  {metricas.entradasVendidas} / {metricas.capacidadTotal}
                </Text>
              </View>
              <View style={estilos.tarjetaMetrica}>
                <Text style={estilos.etiquetaMetrica}>Ocupación</Text>
                <Text style={estilos.valorMetrica}>
                  {metricas.porcentajeOcupacion}%
                </Text>
              </View>
            </View>
          ) : null}

          <View style={estilos.tarjeta}>
            <Text style={estilos.tituloSeccion}>
              Disponibilidad por tipo de entrada
            </Text>
            {(datosVentas.disponibilidadEntradas || []).map((tipo) => (
              <BarraCupo
                key={tipo.id}
                nombre={tipo.nombre}
                precio={tipo.precio}
                disponible={tipo.cupoDisponible}
                vendidas={vendidasPorTipoEntrada[tipo.id] || 0}
              />
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.filaChips}
          >
            <Pressable
              onPress={() => setEstadoSeleccionado('TODAS')}
              accessibilityRole="button"
              accessibilityLabel={`Todas las compras (${totalCompras})`}
              accessibilityState={{ selected: estadoSeleccionado === 'TODAS' }}
              style={[
                estilos.chipEstado,
                estadoSeleccionado === 'TODAS' && estilos.chipEstadoActivo,
              ]}
            >
              <Text
                style={[
                  estilos.textoChipEstado,
                  estadoSeleccionado === 'TODAS' &&
                    estilos.textoChipEstadoActivo,
                ]}
              >
                Todas ({totalCompras})
              </Text>
            </Pressable>

            {CLAVES_ESTADO.map((claveEstado) => {
              const cantidad =
                datosVentas.resumenPorEstado?.[claveEstado]?.length || 0;
              const cfg = CONFIG_ESTADO_COMPRA[claveEstado];
              const activo = estadoSeleccionado === claveEstado;
              return (
                <Pressable
                  key={claveEstado}
                  onPress={() => setEstadoSeleccionado(claveEstado)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cfg.etiqueta}: ${cantidad}`}
                  accessibilityState={{ selected: activo }}
                  style={[
                    estilos.chipEstado,
                    activo && estilos.chipEstadoActivo,
                  ]}
                >
                  <Text
                    style={[
                      estilos.textoChipEstado,
                      activo && estilos.textoChipEstadoActivo,
                    ]}
                  >
                    {cfg.etiqueta} ({cantidad})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={estilos.tituloSeccion}>
            Compras registradas ({comprasFiltradas.length})
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EstadoVacio
          icono="receipt-outline"
          titulo="No hay compras para el estado seleccionado"
          subtitulo="Probá seleccionando otro filtro de estado."
        />
      }
      renderItem={({ item }) => (
        <View style={estilos.tarjetaCompra}>
          <Pressable
            onPress={() => enrutador.push(`/compra/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de compra de ${obtenerNombreCompleto(item.comprador)}`}
            style={estilos.principalCompra}
          >
            <View style={estilos.superiorCompra}>
              <Text style={estilos.nombreComprador}>
                {obtenerNombreCompleto(item.comprador)}
              </Text>
              <InsigniaEstado estado={item.estado} />
            </View>

            <View style={estilos.medioCompra}>
              <Text style={estilos.resumenEntrada}>
                {item.tipoEntrada?.nombre} × {item.cantidad}
              </Text>
              <Text style={estilos.totalCompra}>
                {formatearMoneda(item.total)}
              </Text>
            </View>
          </Pressable>

          <View style={estilos.accionesCompra}>
            <Pressable
              onPress={() => enrutador.push(`/compra/${item.id}/chat`)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir chat con ${obtenerNombreCompleto(item.comprador)}`}
              style={estilos.accesoChat}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={colores.primario}
              />
              <Text style={estilos.textoAccesoChat}>
                Chat ({item.mensajes?.length || 0})
              </Text>
            </Pressable>

            {item.estado === 'CONFIRMADA' ? (
              <BotonPrimario
                etiqueta="Marcar como utilizada"
                cargando={mutacionMarcarUtilizada.isPending}
                alPresionar={() => void manejarCheckIn(item.id)}
                estilo={estilos.botonUsar}
              />
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  bloqueEncabezado: {
    gap: espaciado.md,
    marginBottom: espaciado.xs,
  },
  tituloEvento: {
    fontSize: tipografia.xl,
    fontWeight: '700',
    color: colores.texto,
  },
  filaMetricas: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  tarjetaMetrica: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderRadius: bordes.md,
    padding: espaciado.md,
    gap: 4,
    ...sombras.tarjeta,
  },
  etiquetaMetrica: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  valorMetrica: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.primario,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.sm,
    ...sombras.tarjeta,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  filaChips: {
    gap: espaciado.sm,
    paddingVertical: espaciado.xs,
  },
  chipEstado: {
    minHeight: 38,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    justifyContent: 'center',
  },
  chipEstadoActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChipEstado: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoChipEstadoActivo: {
    color: colores.textoPrimario,
  },
  tarjetaCompra: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  principalCompra: {
    gap: espaciado.sm,
  },
  superiorCompra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  nombreComprador: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
    flex: 1,
  },
  medioCompra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumenEntrada: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  totalCompra: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.primario,
  },
  accionesCompra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingTop: espaciado.sm,
    gap: espaciado.sm,
  },
  accesoChat: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espaciado.md,
    borderRadius: bordes.md,
    backgroundColor: colores.primarioClaro,
  },
  textoAccesoChat: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
  },
  botonUsar: {
    flex: 1,
  },
});
