import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { InsigniaEstado } from '@/components/InsigniaEstado';
import { PastillaDiasFaltantes } from '@/components/PastillaDiasFaltantes';
import { useSesion } from '@/context/SesionContext';
import {
  useCancelarCompra,
  useCompra,
  useMarcarCompraUtilizada,
  usePagarCompra,
} from '@/hooks/useCompras';
import { CONFIG_ESTADO_COMPRA } from '@/lib/estadoCompra';
import {
  formatearFechaCompleta,
  formatearMoneda,
  obtenerNombreCompleto,
} from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

export default function PantallaDetalleCompra() {
  const { id } = useLocalSearchParams();
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const consultaCompra = useCompra(id);
  const mutacionPagar = usePagarCompra();
  const mutacionCancelar = useCancelarCompra();
  const mutacionMarcarUtilizada = useMarcarCompraUtilizada();

  if (consultaCompra.isLoading) {
    return <EstadoCarga mensaje="Cargando detalle de la compra..." />;
  }

  if (consultaCompra.isError || !consultaCompra.data) {
    return (
      <EstadoError
        mensaje={
          consultaCompra.error instanceof Error
            ? consultaCompra.error.message
            : 'No encontramos la compra solicitada'
        }
        alReintentar={() => void consultaCompra.refetch()}
      />
    );
  }

  const compra = consultaCompra.data;
  const esComprador = Boolean(usuarioId && compra.comprador?.id === usuarioId);
  const esOrganizador = Boolean(
    usuarioId && compra.evento?.organizador?.id === usuarioId
  );

  const manejarPago = async () => {
    try {
      await mutacionPagar.mutateAsync({
        compraId: compra.id,
        usuarioId,
      });
      Alert.alert(
        '¡Pago confirmado!',
        'Tu compra pasó a estado Confirmada. Ya tenés tus entradas listas para el evento.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo procesar el pago',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  const manejarConfirmarCancelacion = () => {
    const estaConfirmada = compra.estado === 'CONFIRMADA';
    const explicacion = estaConfirmada
      ? 'Como la compra ya estaba abonada, pasará a estado Reembolsada y se devolverán las entradas al cupo disponible.'
      : 'La reserva pasará a estado Cancelada sin cargo y se liberará el cupo reservado.';

    Alert.alert('¿Cancelar esta compra?', explicacion, [
      { text: 'No, conservar', style: 'cancel' },
      {
        text: estaConfirmada
          ? 'Sí, cancelar y reembolsar'
          : 'Sí, cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            await mutacionCancelar.mutateAsync({
              compraId: compra.id,
              usuarioId,
            });
          } catch (err) {
            Alert.alert(
              'No se pudo cancelar',
              err instanceof Error ? err.message : 'Error inesperado'
            );
          }
        },
      },
    ]);
  };

  const manejarMarcarComoUtilizada = async () => {
    try {
      await mutacionMarcarUtilizada.mutateAsync({
        compraId: compra.id,
        usuarioId,
      });
      Alert.alert(
        'Entrada registrada',
        'La compra fue marcada como Utilizada. El comprador ya puede calificar el evento.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo actualizar',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <View style={estilos.filaEstado}>
          <InsigniaEstado estado={compra.estado} />
          {compra.estado === 'CONFIRMADA' ? (
            <PastillaDiasFaltantes
              fechaEvento={compra.evento?.fecha}
              diasDesdeBackend={compra.diasFaltantesParaEvento}
            />
          ) : null}
        </View>

        <Pressable
          onPress={() =>
            compra.evento?.id && enrutador.push(`/evento/${compra.evento.id}`)
          }
          accessibilityRole="button"
          accessibilityLabel={`Ir al evento ${compra.evento?.nombre}`}
        >
          <Text style={estilos.tituloEvento}>{compra.evento?.nombre}</Text>
        </Pressable>
        <Text style={estilos.fechaEvento}>
          {formatearFechaCompleta(compra.evento?.fecha)}
        </Text>

        <View style={estilos.divisor} />

        <View style={estilos.filaDetalle}>
          <Text style={estilos.etiquetaDetalle}>Comprador</Text>
          <Text style={estilos.valorDetalle}>
            {obtenerNombreCompleto(compra.comprador)}
          </Text>
        </View>
        <View style={estilos.filaDetalle}>
          <Text style={estilos.etiquetaDetalle}>Tipo de entrada</Text>
          <Text style={estilos.valorDetalle}>{compra.tipoEntrada?.nombre}</Text>
        </View>
        <View style={estilos.filaDetalle}>
          <Text style={estilos.etiquetaDetalle}>Cantidad</Text>
          <Text style={estilos.valorDetalle}>{compra.cantidad}</Text>
        </View>
        <View style={[estilos.filaDetalle, estilos.filaTotal]}>
          <Text style={estilos.etiquetaTotal}>Total</Text>
          <Text style={estilos.valorTotal}>{formatearMoneda(compra.total)}</Text>
        </View>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.tituloSeccion}>Acciones disponibles</Text>

        {esComprador && compra.estado === 'PENDIENTE' ? (
          <BotonPrimario
            etiqueta={`Pagar ahora · ${formatearMoneda(compra.total)}`}
            cargando={mutacionPagar.isPending}
            alPresionar={() => void manejarPago()}
          />
        ) : null}

        {esOrganizador && compra.estado === 'CONFIRMADA' ? (
          <BotonPrimario
            etiqueta="Marcar entrada como utilizada (Check-in)"
            cargando={mutacionMarcarUtilizada.isPending}
            alPresionar={() => void manejarMarcarComoUtilizada()}
          />
        ) : null}

        {esComprador && compra.puedeSerReseniada ? (
          <BotonPrimario
            etiqueta="Calificar evento"
            alPresionar={() => enrutador.push(`/compra/${compra.id}/resenia`)}
          />
        ) : null}

        {compra.yaFueReseniada ? (
          <View style={estilos.bannerReseniada}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colores.exito}
            />
            <Text style={estilos.textoReseniada}>
              Ya calificaste tu experiencia en este evento. ¡Gracias!
            </Text>
          </View>
        ) : null}

        <BotonPrimario
          etiqueta={`Abrir chat (${compra.mensajes?.length || 0} mensajes)`}
          variante="secundario"
          alPresionar={() => enrutador.push(`/compra/${compra.id}/chat`)}
        />

        {compra.puedeCancelarse && (esComprador || esOrganizador) ? (
          <BotonPrimario
            etiqueta={
              compra.estado === 'CONFIRMADA'
                ? 'Cancelar compra y solicitar reembolso'
                : 'Cancelar reserva'
            }
            variante="peligro"
            cargando={mutacionCancelar.isPending}
            alPresionar={manejarConfirmarCancelacion}
          />
        ) : null}
      </View>

      {compra.cambiosEstado && compra.cambiosEstado.length > 0 ? (
        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloSeccion}>Historial de estados</Text>
          {compra.cambiosEstado.map((cambio, indice) => {
            const cfg =
              CONFIG_ESTADO_COMPRA[cambio.estado] ||
              CONFIG_ESTADO_COMPRA.PENDIENTE;
            return (
              <View key={cambio.id || indice} style={estilos.itemLineaTiempo}>
                <View
                  style={[
                    estilos.puntoLineaTiempo,
                    { backgroundColor: cfg.color },
                  ]}
                />
                <View style={estilos.cuerpoLineaTiempo}>
                  <Text style={estilos.estadoLineaTiempo}>{cfg.etiqueta}</Text>
                  <Text style={estilos.metaLineaTiempo}>
                    {formatearFechaCompleta(cambio.fechaHora)} · por{' '}
                    {obtenerNombreCompleto(cambio.quien)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  filaEstado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.sm,
  },
  tituloEvento: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.primario,
  },
  fechaEvento: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  divisor: {
    height: 1,
    backgroundColor: colores.borde,
  },
  filaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiquetaDetalle: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
  valorDetalle: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.texto,
  },
  filaTotal: {
    paddingTop: espaciado.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  etiquetaTotal: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  valorTotal: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.primario,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  bannerReseniada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.exitoFondo,
    padding: espaciado.md,
    borderRadius: bordes.md,
  },
  textoReseniada: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.exito,
    flex: 1,
  },
  itemLineaTiempo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.md,
  },
  puntoLineaTiempo: {
    width: 10,
    height: 10,
    borderRadius: bordes.completo,
    marginTop: 5,
  },
  cuerpoLineaTiempo: {
    flex: 1,
    gap: 2,
  },
  estadoLineaTiempo: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  metaLineaTiempo: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
});
