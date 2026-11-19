import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { colores, espaciado, tipografia } from '@/tema';

export function EstadoVacio({
  icono = 'ticket-outline',
  titulo,
  subtitulo,
  etiquetaAccion,
  alAccionar,
}) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={48} color={colores.textoSecundario} />
      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      {etiquetaAccion && alAccionar ? (
        <BotonPrimario
          etiqueta={etiquetaAccion}
          alPresionar={alAccionar}
          variante="secundario"
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
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
    marginTop: espaciado.xs,
  },
  subtitulo: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
  },
  boton: {
    marginTop: espaciado.md,
  },
});
