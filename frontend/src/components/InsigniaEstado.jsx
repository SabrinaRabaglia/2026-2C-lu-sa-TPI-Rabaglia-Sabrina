import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG_ESTADO_COMPRA } from '@/lib/estadoCompra';
import { bordes, espaciado, tipografia } from '@/tema';

export function InsigniaEstado({ estado }) {
  const config =
    CONFIG_ESTADO_COMPRA[estado] || CONFIG_ESTADO_COMPRA.PENDIENTE;

  return (
    <View
      style={[estilos.insignia, { backgroundColor: config.colorFondo }]}
      accessibilityRole="text"
      accessibilityLabel={`Estado: ${config.etiqueta}`}
    >
      <Ionicons name={config.icono} size={14} color={config.color} />
      <Text style={[estilos.texto, { color: config.color }]}>
        {config.etiqueta}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  insignia: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaciado.xs,
    paddingHorizontal: espaciado.sm + 2,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
  },
  texto: {
    fontSize: tipografia.xs,
    fontWeight: '700',
  },
});
