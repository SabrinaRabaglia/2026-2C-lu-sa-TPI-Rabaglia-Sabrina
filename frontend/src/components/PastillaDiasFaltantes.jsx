import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatearDiasFaltantes } from '@/lib/formato';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function PastillaDiasFaltantes({ fechaEvento, diasDesdeBackend }) {
  let etiqueta = null;

  if (typeof diasDesdeBackend === 'number') {
    if (diasDesdeBackend === 0) {
      etiqueta = 'Es hoy';
    } else if (diasDesdeBackend === 1) {
      etiqueta = 'Mañana';
    } else if (diasDesdeBackend > 1) {
      etiqueta = `Faltan ${diasDesdeBackend} días`;
    }
  } else if (fechaEvento) {
    etiqueta = formatearDiasFaltantes(fechaEvento);
  }

  if (!etiqueta) return null;

  return (
    <View
      style={estilos.pastilla}
      accessibilityRole="text"
      accessibilityLabel={etiqueta}
    >
      <Ionicons
        name="calendar-outline"
        size={13}
        color={colores.primarioTextoClaro}
      />
      <Text style={estilos.texto}>{etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pastilla: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaciado.xs,
    backgroundColor: colores.primarioClaro,
    paddingHorizontal: espaciado.sm + 2,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  texto: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primarioTextoClaro,
  },
});
