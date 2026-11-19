import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EstrellasPuntaje } from '@/components/EstrellasPuntaje';
import { obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function ItemResenia({ resenia }) {
  const nombreAutor = obtenerNombreCompleto(resenia?.comprador) || 'Asistente';
  const nombreEvento = resenia?.evento?.nombre;

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.encabezado}>
        <View style={estilos.bloqueAutor}>
          <Text style={estilos.autor}>{nombreAutor}</Text>
          {nombreEvento ? (
            <Text style={estilos.nombreEvento}>en {nombreEvento}</Text>
          ) : null}
        </View>
        <EstrellasPuntaje puntaje={resenia?.puntuacion || 0} tamanio={15} />
      </View>
      {resenia?.detalle ? (
        <Text style={estilos.comentario}>{resenia.detalle}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    padding: espaciado.md,
    gap: espaciado.xs,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espaciado.sm,
  },
  bloqueAutor: {
    flex: 1,
  },
  autor: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  nombreEvento: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  comentario: {
    fontSize: tipografia.sm,
    color: colores.texto,
    lineHeight: 20,
    marginTop: 2,
  },
});
