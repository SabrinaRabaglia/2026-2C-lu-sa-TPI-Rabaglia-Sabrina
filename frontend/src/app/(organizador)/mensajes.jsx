import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { InsigniaEstado } from '@/components/InsigniaEstado';
import { useSesion } from '@/context/SesionContext';
import { useBandejaOrganizador } from '@/hooks/useCompras';
import { formatearHora, obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

export default function PantallaMensajesOrganizador() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();
  const [filtro, setFiltro] = useState('TODAS');

  const consultaBandeja = useBandejaOrganizador(usuarioId);

  const conversaciones = useMemo(() => {
    const lista = Array.isArray(consultaBandeja.data)
      ? consultaBandeja.data
      : consultaBandeja.data?.items || [];
    return lista;
  }, [consultaBandeja.data]);

  const cantidadSinResponder = useMemo(
    () => conversaciones.filter((c) => c.pendienteRespuestaOrganizador).length,
    [conversaciones]
  );

  const conversacionesFiltradas = useMemo(() => {
    if (filtro === 'PENDIENTES') {
      return conversaciones.filter((c) => c.pendienteRespuestaOrganizador);
    }
    return conversaciones;
  }, [conversaciones, filtro]);

  if (consultaBandeja.isLoading) {
    return <EstadoCarga mensaje="Cargando bandeja de mensajes..." />;
  }

  if (consultaBandeja.isError) {
    return (
      <EstadoError
        mensaje={
          consultaBandeja.error instanceof Error
            ? consultaBandeja.error.message
            : 'No pudimos cargar tu bandeja de mensajes'
        }
        alReintentar={() => void consultaBandeja.refetch()}
      />
    );
  }

  return (
    <View style={estilos.pantalla}>
      {/* Cabecera con notificación de pendientes y filtro */}
      <View style={estilos.encabezadoFiltros}>
        {cantidadSinResponder > 0 ? (
          <View style={estilos.bannerNotificacion}>
            <Ionicons
              name="notifications"
              size={18}
              color={colores.acento}
            />
            <Text style={estilos.textoBanner}>
              Tenés {cantidadSinResponder}{' '}
              {cantidadSinResponder === 1
                ? 'consulta pendiente de respuesta'
                : 'consultas pendientes de respuesta'}
            </Text>
          </View>
        ) : null}

        <View style={estilos.filaFiltros}>
          <Pressable
            onPress={() => setFiltro('TODAS')}
            accessibilityRole="button"
            accessibilityState={{ selected: filtro === 'TODAS' }}
            style={[
              estilos.chipFiltro,
              filtro === 'TODAS' && estilos.chipFiltroActivo,
            ]}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtro === 'TODAS' && estilos.textoChipFiltroActivo,
              ]}
            >
              Todas ({conversaciones.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltro('PENDIENTES')}
            accessibilityRole="button"
            accessibilityState={{ selected: filtro === 'PENDIENTES' }}
            style={[
              estilos.chipFiltro,
              filtro === 'PENDIENTES' && estilos.chipFiltroActivo,
            ]}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtro === 'PENDIENTES' && estilos.textoChipFiltroActivo,
              ]}
            >
              Sin responder ({cantidadSinResponder})
            </Text>
          </Pressable>
        </View>
      </View>

      {conversacionesFiltradas.length === 0 ? (
        <EstadoVacio
          icono="chatbubbles-outline"
          titulo={
            filtro === 'PENDIENTES'
              ? '¡Estás al día! No tenés mensajes sin responder'
              : 'Todavía no recibiste mensajes'
          }
          subtitulo="Cuando un comprador envíe una consulta sobre alguno de tus eventos aparecerá automáticamente acá."
        />
      ) : (
        <FlatList
          data={conversacionesFiltradas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.contenidoLista}
          refreshControl={
            <RefreshControl
              refreshing={consultaBandeja.isRefetching}
              onRefresh={() => void consultaBandeja.refetch()}
              tintColor={colores.primario}
            />
          }
          renderItem={({ item }) => {
            const sinResponder = Boolean(item.pendienteRespuestaOrganizador);
            const nombreComprador =
              obtenerNombreCompleto(item.comprador) || 'Comprador';
            const iniciales = item.comprador
              ? `${item.comprador.nombre.charAt(0)}${item.comprador.apellido.charAt(0)}`.toUpperCase()
              : 'CO';
            const ultimo = item.ultimoMensaje;

            return (
              <Pressable
                onPress={() => enrutador.push(`/compra/${item.id}/chat`)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  estilos.tarjetaChat,
                  sinResponder && estilos.tarjetaChatPendiente,
                  pressed && estilos.tarjetaPresionada,
                ]}
              >
                <View style={estilos.filaSuperior}>
                  <View style={estilos.avatar}>
                    <Text style={estilos.textoAvatar}>{iniciales}</Text>
                    {sinResponder ? <View style={estilos.puntoNuevo} /> : null}
                  </View>

                  <View style={estilos.columnaCabecera}>
                    <View style={estilos.filaNombreHora}>
                      <Text style={estilos.nombreComprador} numberOfLines={1}>
                        {nombreComprador}
                      </Text>
                      {ultimo?.enviado ? (
                        <Text style={estilos.horaMensaje}>
                          {formatearHora(ultimo.enviado)}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={estilos.subtituloEvento} numberOfLines={1}>
                      {item.evento?.nombre} · {item.tipoEntrada?.nombre} ×{' '}
                      {item.cantidad}
                    </Text>
                  </View>
                </View>

                {ultimo?.mensaje ? (
                  <Text style={estilos.previewMensaje} numberOfLines={2}>
                    {sinResponder ? '' : 'Vos: '}
                    {ultimo.mensaje}
                  </Text>
                ) : null}

                <View style={estilos.filaPie}>
                  <InsigniaEstado estado={item.estado} />

                  {sinResponder ? (
                    <View style={estilos.insigniaSinResponder}>
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color={colores.acento}
                      />
                      <Text style={estilos.textoSinResponder}>
                        Sin responder
                      </Text>
                    </View>
                  ) : (
                    <View style={estilos.insigniaRespondido}>
                      <Ionicons
                        name="checkmark-done"
                        size={14}
                        color={colores.exito}
                      />
                      <Text style={estilos.textoRespondido}>Respondido</Text>
                    </View>
                  )}
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
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    gap: espaciado.sm,
  },
  bannerNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.acentoClaro,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: bordes.md,
  },
  textoBanner: {
    flex: 1,
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.peligro,
  },
  filaFiltros: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  chipFiltro: {
    minHeight: 38,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    justifyContent: 'center',
  },
  chipFiltroActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChipFiltro: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoChipFiltroActivo: {
    color: colores.textoPrimario,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  tarjetaChat: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.tarjeta,
  },
  tarjetaChatPendiente: {
    borderColor: colores.acento,
    borderWidth: 1.5,
  },
  tarjetaPresionada: {
    opacity: 0.9,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textoAvatar: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primarioTextoClaro,
  },
  puntoNuevo: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: bordes.completo,
    backgroundColor: colores.acento,
    borderWidth: 2,
    borderColor: colores.superficie,
  },
  columnaCabecera: {
    flex: 1,
    gap: 2,
  },
  filaNombreHora: {
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
  horaMensaje: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  subtituloEvento: {
    fontSize: tipografia.xs,
    color: colores.primarioTextoClaro,
    fontWeight: '600',
  },
  previewMensaje: {
    fontSize: tipografia.sm,
    color: colores.texto,
    backgroundColor: colores.fondo,
    padding: espaciado.sm + 2,
    borderRadius: bordes.md,
    lineHeight: 20,
  },
  filaPie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  insigniaSinResponder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colores.acentoClaro,
    paddingHorizontal: espaciado.sm + 2,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoSinResponder: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.peligro,
  },
  insigniaRespondido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colores.exitoFondo,
    paddingHorizontal: espaciado.sm + 2,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoRespondido: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.exito,
  },
});
