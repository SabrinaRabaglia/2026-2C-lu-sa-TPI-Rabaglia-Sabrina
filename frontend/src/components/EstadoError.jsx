import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { colores, espaciado, tipografia } from '@/tema';

export function EstadoError({ mensaje, alReintentar }) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="alert-circle-outline" size={48} color={colores.peligro} />
      <Text style={estilos.titulo}>Algo salió mal</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {alReintentar ? (
        <BotonPrimario
          etiqueta="Reintentar"
          alPresionar={alReintentar}
          etiquetaAccesibilidad="Reintentar carga"
          estilo={estilos.boton}
        />
      ) : null}
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
    gap: espaciado.sm,
  },
  titulo: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
    marginTop: espaciado.xs,
  },
  mensaje: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
  },
  boton: {
    marginTop: espaciado.md,
    minWidth: 160,
  },
});
