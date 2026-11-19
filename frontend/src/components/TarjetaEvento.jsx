import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  formatearFechaEvento,
  formatearMoneda,
  obtenerNombreCompleto,
} from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const PORTADA_POR_DEFECTO =
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80';

export function TarjetaEvento({
  evento,
  esFavorito = false,
  alPresionar,
  alAlternarFavorito,
}) {
  const urlPortada = evento?.multimedia?.[0] || PORTADA_POR_DEFECTO;
  const nombreCategoria = evento?.categoria?.nombre || 'Evento';
  const nombreOrganizador =
    obtenerNombreCompleto(evento?.organizador) || 'Organizador';
  const puntaje = evento?.puntajeOrganizador || 0;
  const cantidadResenias = evento?.reseniasOrganizador?.length || 0;
  const precioMinimo =
    typeof evento?.precioMinimo === 'number'
      ? evento.precioMinimo
      : evento?.tiposEntrada?.length
        ? Math.min(...evento.tiposEntrada.map((t) => t.precio))
        : 0;
  const estaAgotado = Boolean(evento?.agotado);

  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${evento.nombre}`}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.tarjetaPresionada]}
    >
      <View style={estilos.contenedorImagen}>
        <Image
          source={{ uri: urlPortada }}
          style={estilos.portada}
          contentFit="cover"
          transition={200}
        />
        <View style={estilos.filaSuperior}>
          <View style={estilos.insigniaCategoria}>
            <Text style={estilos.textoCategoria}>{nombreCategoria}</Text>
          </View>

          {alAlternarFavorito ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                alAlternarFavorito();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'
              }
              style={estilos.botonFavorito}
            >
              <Ionicons
                name={esFavorito ? 'heart' : 'heart-outline'}
                size={22}
                color={esFavorito ? colores.acento : colores.texto}
              />
            </Pressable>
          ) : null}
        </View>

        {estaAgotado ? (
          <View style={estilos.insigniaAgotado}>
            <Text style={estilos.textoAgotado}>Agotado</Text>
          </View>
        ) : null}
      </View>

      <View style={estilos.cuerpo}>
        <Text style={estilos.textoFecha}>{formatearFechaEvento(evento.fecha)}</Text>
        <Text style={estilos.titulo} numberOfLines={2}>
          {evento.nombre}
        </Text>

        <View style={estilos.filaPie}>
          <View style={estilos.filaOrganizador}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colores.textoSecundario}
            />
            <Text style={estilos.nombreOrganizador} numberOfLines={1}>
              {nombreOrganizador}
            </Text>
            <View style={estilos.insigniaPuntaje}>
              <Ionicons name="star" size={12} color={colores.estrella} />
              <Text style={estilos.textoPuntaje}>
                {puntaje > 0
                  ? `${puntaje.toFixed(1)} (${cantidadResenias})`
                  : 'Sin reseñas'}
              </Text>
            </View>
          </View>

          <Text style={estilos.textoPrecio}>
            Desde {formatearMoneda(precioMinimo)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    overflow: 'hidden',
    ...sombras.tarjeta,
  },
  tarjetaPresionada: {
    opacity: 0.92,
  },
  contenedorImagen: {
    height: 170,
    width: '100%',
    backgroundColor: colores.borde,
    position: 'relative',
  },
  portada: {
    width: '100%',
    height: '100%',
  },
  filaSuperior: {
    position: 'absolute',
    top: espaciado.sm,
    left: espaciado.sm,
    right: espaciado.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insigniaCategoria: {
    backgroundColor: 'rgba(20, 20, 31, 0.78)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
  },
  textoCategoria: {
    color: colores.textoPrimario,
    fontSize: tipografia.xs,
    fontWeight: '700',
  },
  botonFavorito: {
    width: 44,
    height: 44,
    borderRadius: bordes.completo,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaAgotado: {
    position: 'absolute',
    bottom: espaciado.sm,
    left: espaciado.sm,
    backgroundColor: colores.peligro,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  textoAgotado: {
    color: colores.textoPrimario,
    fontSize: tipografia.xs,
    fontWeight: '700',
  },
  cuerpo: {
    padding: espaciado.lg,
    gap: espaciado.xs,
  },
  textoFecha: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
    textTransform: 'capitalize',
  },
  titulo: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
  },
  filaPie: {
    marginTop: espaciado.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  filaOrganizador: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  nombreOrganizador: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
    flexShrink: 1,
  },
  insigniaPuntaje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  textoPuntaje: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoPrecio: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
});
