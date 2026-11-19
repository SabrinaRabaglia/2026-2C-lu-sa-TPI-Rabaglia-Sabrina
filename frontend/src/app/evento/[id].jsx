import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstrellasPuntaje } from '@/components/EstrellasPuntaje';
import { ItemResenia } from '@/components/ItemResenia';
import { useSesion } from '@/context/SesionContext';
import { useEvento } from '@/hooks/useEventos';
import { useAlternarFavorito, useFavoritos } from '@/hooks/useFavoritos';
import {
  formatearFechaCompleta,
  formatearMoneda,
  obtenerNombreCompleto,
} from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80';
const ANCHO_PANTALLA = Dimensions.get('window').width;

export default function PantallaDetalleEvento() {
  const { id } = useLocalSearchParams();
  const enrutador = useRouter();
  const { usuarioId } = useSesion();
  const [mostrarTodasResenias, setMostrarTodasResenias] = useState(false);

  const consultaEvento = useEvento(id);
  const consultaFavoritos = useFavoritos(usuarioId);
  const mutacionAlternarFavorito = useAlternarFavorito(usuarioId);

  const esFavorito = useMemo(() => {
    const lista = consultaFavoritos.data || [];
    return lista.some((fav) => fav.id === id);
  }, [consultaFavoritos.data, id]);

  if (consultaEvento.isLoading) {
    return <EstadoCarga mensaje="Cargando detalle del evento..." />;
  }

  if (consultaEvento.isError || !consultaEvento.data) {
    return (
      <EstadoError
        mensaje={
          consultaEvento.error instanceof Error
            ? consultaEvento.error.message
            : 'No encontramos el evento solicitado'
        }
        alReintentar={() => void consultaEvento.refetch()}
      />
    );
  }

  const evento = consultaEvento.data;
  const imagenes =
    evento.multimedia && evento.multimedia.length > 0
      ? evento.multimedia
      : [IMAGEN_POR_DEFECTO];
  const esOrganizadorDuenio = Boolean(
    usuarioId && evento.organizador?.id === usuarioId
  );
  const finalizado = new Date(evento.fecha).getTime() <= Date.now();
  const agotado = Boolean(evento.agotado);
  const resenias = evento.reseniasOrganizador || [];
  const reseniasMostradas = mostrarTodasResenias
    ? resenias
    : resenias.slice(0, 3);

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenidoScroll}>
        <View style={estilos.contenedorCarrusel}>
          <FlatList
            data={imagenes}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, indice) => `${uri}-${indice}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={estilos.imagenCarrusel}
                contentFit="cover"
              />
            )}
          />

          <Pressable
            onPress={() =>
              mutacionAlternarFavorito.mutate({ evento, esFavorito })
            }
            accessibilityRole="button"
            accessibilityLabel={
              esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'
            }
            style={estilos.botonFavorito}
          >
            <Ionicons
              name={esFavorito ? 'heart' : 'heart-outline'}
              size={24}
              color={esFavorito ? colores.acento : colores.texto}
            />
          </Pressable>
        </View>

        <View style={estilos.cuerpo}>
          <View style={estilos.filaInsignias}>
            <View style={estilos.insigniaCategoria}>
              <Text style={estilos.textoCategoria}>
                {evento.categoria?.nombre || 'Evento'}
              </Text>
            </View>
            {finalizado ? (
              <View
                style={[
                  estilos.chipEstado,
                  { backgroundColor: colores.neutroFondo },
                ]}
              >
                <Text
                  style={[
                    estilos.textoChipEstado,
                    { color: colores.neutro },
                  ]}
                >
                  Evento finalizado
                </Text>
              </View>
            ) : agotado ? (
              <View
                style={[
                  estilos.chipEstado,
                  { backgroundColor: colores.peligroFondo },
                ]}
              >
                <Text
                  style={[
                    estilos.textoChipEstado,
                    { color: colores.peligro },
                  ]}
                >
                  Entradas agotadas
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={estilos.titulo}>{evento.nombre}</Text>

          <View style={estilos.filaInfo}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colores.primario}
            />
            <Text style={estilos.textoInfo}>
              {formatearFechaCompleta(evento.fecha)}
            </Text>
          </View>

          {evento.descripcion ? (
            <View style={estilos.tarjetaSeccion}>
              <Text style={estilos.tituloSeccion}>Acerca del evento</Text>
              <Text style={estilos.descripcion}>{evento.descripcion}</Text>
            </View>
          ) : null}

          <View style={estilos.tarjetaSeccion}>
            <Text style={estilos.tituloSeccion}>Tipos de entrada</Text>
            <View style={estilos.listaEntradas}>
              {(evento.tiposEntrada || []).map((tipo) => {
                const sinCupo = tipo.cupo <= 0;
                return (
                  <View key={tipo.id} style={estilos.filaEntrada}>
                    <View style={estilos.izquierdaEntrada}>
                      <Text style={estilos.nombreEntrada}>{tipo.nombre}</Text>
                      {tipo.descripcion ? (
                        <Text style={estilos.descripcionEntrada}>
                          {tipo.descripcion}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          estilos.cupoEntrada,
                          sinCupo && { color: colores.peligro },
                        ]}
                      >
                        {sinCupo ? 'Agotado' : `Quedan ${tipo.cupo}`}
                      </Text>
                    </View>
                    <Text style={estilos.precioEntrada}>
                      {formatearMoneda(tipo.precio)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={estilos.tarjetaSeccion}>
            <Text style={estilos.tituloSeccion}>Organizador y reputación</Text>
            <View style={estilos.encabezadoOrganizador}>
              <View style={estilos.avatarOrganizador}>
                <Ionicons name="person" size={22} color={colores.primario} />
              </View>
              <View style={estilos.metaOrganizador}>
                <Text style={estilos.nombreOrganizador}>
                  {obtenerNombreCompleto(evento.organizador)}
                </Text>
                <View style={estilos.filaPuntaje}>
                  <EstrellasPuntaje
                    puntaje={evento.puntajeOrganizador || 0}
                    tamanio={16}
                  />
                  <Text style={estilos.textoPuntaje}>
                    {evento.puntajeOrganizador > 0
                      ? `${evento.puntajeOrganizador.toFixed(1)} · ${resenias.length} ${
                          resenias.length === 1 ? 'reseña' : 'reseñas'
                        }`
                      : 'Sin reseñas todavía'}
                  </Text>
                </View>
              </View>
            </View>

            {resenias.length > 0 ? (
              <View style={estilos.listaResenias}>
                <Text style={estilos.subtituloResenias}>
                  Experiencias en eventos anteriores de este organizador:
                </Text>
                {reseniasMostradas.map((rev) => (
                  <ItemResenia key={rev.id} resenia={rev} />
                ))}
                {resenias.length > 3 ? (
                  <BotonPrimario
                    etiqueta={
                      mostrarTodasResenias
                        ? 'Mostrar menos reseñas'
                        : `Ver todas las reseñas (${resenias.length})`
                    }
                    alPresionar={() =>
                      setMostrarTodasResenias((previo) => !previo)
                    }
                    variante="fantasma"
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View style={estilos.barraInferior}>
        {esOrganizadorDuenio ? (
          <BotonPrimario
            etiqueta="Ver ventas y disponibilidad"
            alPresionar={() => enrutador.push(`/evento/${evento.id}/ventas`)}
          />
        ) : (
          <BotonPrimario
            etiqueta={
              finalizado
                ? 'Evento finalizado'
                : agotado
                  ? 'Entradas agotadas'
                  : 'Comprar entradas'
            }
            deshabilitado={finalizado || agotado}
            alPresionar={() => enrutador.push(`/evento/${evento.id}/comprar`)}
          />
        )}
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
    paddingBottom: 110,
  },
  contenedorCarrusel: {
    height: 240,
    position: 'relative',
    backgroundColor: colores.borde,
  },
  imagenCarrusel: {
    width: ANCHO_PANTALLA,
    height: 240,
  },
  botonFavorito: {
    position: 'absolute',
    top: espaciado.md,
    right: espaciado.md,
    width: 44,
    height: 44,
    borderRadius: bordes.completo,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  filaInsignias: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  insigniaCategoria: {
    backgroundColor: colores.primarioClaro,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoCategoria: {
    color: colores.primario,
    fontSize: tipografia.xs,
    fontWeight: '700',
  },
  chipEstado: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoChipEstado: {
    fontSize: tipografia.xs,
    fontWeight: '700',
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: '700',
    color: colores.texto,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  textoInfo: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.texto,
    flex: 1,
  },
  tarjetaSeccion: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  descripcion: {
    fontSize: tipografia.sm,
    color: colores.texto,
    lineHeight: 22,
  },
  listaEntradas: {
    gap: espaciado.sm,
  },
  filaEntrada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    gap: espaciado.md,
  },
  izquierdaEntrada: {
    flex: 1,
    gap: 2,
  },
  nombreEntrada: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  descripcionEntrada: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  cupoEntrada: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.exito,
  },
  precioEntrada: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.primario,
  },
  encabezadoOrganizador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  avatarOrganizador: {
    width: 48,
    height: 48,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaOrganizador: {
    flex: 1,
    gap: 4,
  },
  nombreOrganizador: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  filaPuntaje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  textoPuntaje: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  listaResenias: {
    marginTop: espaciado.xs,
    gap: espaciado.sm,
  },
  subtituloResenias: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
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
