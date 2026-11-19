import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { SelectorCantidad } from '@/components/SelectorCantidad';
import { SelectorTipoEntrada } from '@/components/SelectorTipoEntrada';
import { useSesion } from '@/context/SesionContext';
import { useCrearCompra } from '@/hooks/useCompras';
import { useEvento } from '@/hooks/useEventos';
import { formatearFechaCompleta, formatearMoneda } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

export default function PantallaComprarEntradas() {
  const { id } = useLocalSearchParams();
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const consultaEvento = useEvento(id);
  const mutacionCrearCompra = useCrearCompra();

  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const tipos = consultaEvento.data?.tiposEntrada || [];
    if (!tipoSeleccionado && tipos.length > 0) {
      const primeroDisponible = tipos.find((t) => t.cupo > 0) || tipos[0];
      setTipoSeleccionado(primeroDisponible);
      setCantidad(1);
    }
  }, [consultaEvento.data, tipoSeleccionado]);

  if (consultaEvento.isLoading) {
    return <EstadoCarga mensaje="Preparando selección de entradas..." />;
  }

  if (consultaEvento.isError || !consultaEvento.data) {
    return (
      <EstadoError
        mensaje={
          consultaEvento.error instanceof Error
            ? consultaEvento.error.message
            : 'No pudimos cargar el evento'
        }
        alReintentar={() => void consultaEvento.refetch()}
      />
    );
  }

  const evento = consultaEvento.data;
  const cupoDisponible = tipoSeleccionado?.cupo || 0;
  // El backend recalcula el total real; este valor es una vista previa en la UI.
  const totalEstimado = (tipoSeleccionado?.precio || 0) * cantidad;

  const manejarSeleccionTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    const maximoParaTipo = Math.max(1, Math.min(tipo.cupo, 10));
    if (cantidad > maximoParaTipo) {
      setCantidad(maximoParaTipo);
    }
  };

  const manejarConfirmarCompra = async () => {
    if (!usuarioId || !tipoSeleccionado) return;

    try {
      const creada = await mutacionCrearCompra.mutateAsync({
        compradorId: usuarioId,
        eventoId: evento.id,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad,
      });
      enrutador.replace(`/compra/${creada.id}`);
    } catch (err) {
      await consultaEvento.refetch();
      Alert.alert(
        'No se pudo completar la reserva',
        err instanceof Error
          ? err.message
          : 'Ocurrió un problema con el cupo disponible. Actualizamos los datos del evento.'
      );
    }
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenidoScroll}>
        <View style={estilos.bannerEvento}>
          <Text style={estilos.tituloEvento}>{evento.nombre}</Text>
          <Text style={estilos.fechaEvento}>
            {formatearFechaCompleta(evento.fecha)}
          </Text>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>1. Elegí tu tipo de entrada</Text>
          <SelectorTipoEntrada
            tiposEntrada={evento.tiposEntrada || []}
            idSeleccionado={tipoSeleccionado?.id}
            alSeleccionar={manejarSeleccionTipo}
          />
        </View>

        {tipoSeleccionado && cupoDisponible > 0 ? (
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>2. Seleccioná la cantidad</Text>
            <SelectorCantidad
              valor={cantidad}
              disponible={cupoDisponible}
              limiteMaximo={10}
              alCambiar={setCantidad}
            />
          </View>
        ) : null}

        <View style={estilos.tarjetaResumen}>
          <Text style={estilos.encabezadoResumen}>Resumen de tu reserva</Text>
          <View style={estilos.filaResumen}>
            <Text style={estilos.etiquetaResumen}>Entrada</Text>
            <Text style={estilos.valorResumen}>
              {tipoSeleccionado
                ? `${tipoSeleccionado.nombre} × ${cantidad}`
                : '-'}
            </Text>
          </View>
          <View style={estilos.filaResumen}>
            <Text style={estilos.etiquetaResumen}>Precio unitario</Text>
            <Text style={estilos.valorResumen}>
              {tipoSeleccionado
                ? formatearMoneda(tipoSeleccionado.precio)
                : '-'}
            </Text>
          </View>
          <View style={[estilos.filaResumen, estilos.filaTotal]}>
            <Text style={estilos.etiquetaTotal}>Total estimado</Text>
            <Text style={estilos.valorTotal}>
              {formatearMoneda(totalEstimado)}
            </Text>
          </View>
          <Text style={estilos.textoNota}>
            Al confirmar se reservarán tus entradas en estado Pendiente de pago y podrás abonarlas en el siguiente paso.
          </Text>
        </View>
      </ScrollView>

      <View style={estilos.barraInferior}>
        <BotonPrimario
          etiqueta={`Confirmar reserva · ${formatearMoneda(totalEstimado)}`}
          deshabilitado={!tipoSeleccionado || cupoDisponible <= 0}
          cargando={mutacionCrearCompra.isPending}
          alPresionar={() => void manejarConfirmarCompra()}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoScroll: {
    padding: espaciado.lg,
    paddingBottom: 110,
    gap: espaciado.lg,
  },
  bannerEvento: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: 4,
    ...sombras.tarjeta,
  },
  tituloEvento: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
  },
  fechaEvento: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  seccion: {
    gap: espaciado.sm,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  tarjetaResumen: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.sm,
    ...sombras.tarjeta,
  },
  encabezadoResumen: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: espaciado.xs,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiquetaResumen: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
  valorResumen: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.texto,
  },
  filaTotal: {
    marginTop: espaciado.xs,
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
  textoNota: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    marginTop: espaciado.xs,
    lineHeight: 18,
  },
  barraInferior: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
  },
});
