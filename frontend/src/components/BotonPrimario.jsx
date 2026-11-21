import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function BotonPrimario({
  etiqueta,
  alPresionar,
  deshabilitado = false,
  cargando = false,
  variante = 'primario',
  etiquetaAccesibilidad,
  estilo,
}) {
  const estaDeshabilitado = deshabilitado || cargando;

  const estiloVarianteContenedor =
    variante === 'secundario'
      ? estilos.secundario
      : variante === 'peligro'
        ? estilos.peligro
        : variante === 'fantasma'
          ? estilos.fantasma
          : estilos.primario;

  const estiloVarianteTexto =
    variante === 'secundario'
      ? estilos.textoSecundario
      : variante === 'peligro'
        ? estilos.textoPeligro
        : variante === 'fantasma'
          ? estilos.textoFantasma
          : estilos.textoPrimario;

  const colorIndicador =
    variante === 'primario' || variante === 'peligro'
      ? colores.textoPrimario
      : colores.primario;

  return (
    <Pressable
      onPress={alPresionar}
      disabled={estaDeshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiquetaAccesibilidad ?? etiqueta}
      accessibilityState={{ disabled: estaDeshabilitado, busy: cargando }}
      style={({ pressed }) => [
        estilos.base,
        estiloVarianteContenedor,
        estaDeshabilitado && estilos.deshabilitado,
        pressed && !estaDeshabilitado && estilos.presionado,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorIndicador} size="small" />
      ) : (
        <Text style={[estilos.texto, estiloVarianteTexto]}>{etiqueta}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderRadius: bordes.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.primarioClaro,
    borderWidth: 1,
    borderColor: colores.primario,
  },
  peligro: {
    backgroundColor: colores.peligro,
  },
  fantasma: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    fontSize: tipografia.md,
    fontWeight: '600',
  },
  textoPrimario: {
    color: colores.textoPrimario,
  },
  textoSecundario: {
    color: colores.primarioTextoClaro,
  },
  textoPeligro: {
    color: colores.textoPrimario,
  },
  textoFantasma: {
    color: colores.texto,
  },
});
