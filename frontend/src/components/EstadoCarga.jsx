import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colores, espaciado, tipografia } from '@/tema';

export function EstadoCarga({ mensaje = 'Cargando...' }) {
  return (
    <View
      style={estilos.contenedor}
      accessibilityRole="progressbar"
      accessibilityLabel={mensaje}
    >
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    backgroundColor: colores.fondo,
    gap: espaciado.md,
  },
  texto: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
});
