import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { bordes, colores, espaciado, tipografia } from '@/tema';

/**
 * Soporta filtro multi-categoría: el usuario puede seleccionar una o varias categorías a la vez,
 * o tocar "Todas" para limpiar la selección.
 */
export function ChipsCategorias({
  categorias = [],
  idsSeleccionados = [],
  alAlternarCategoria,
  alLimpiarTodas,
}) {
  const todasSeleccionadas = idsSeleccionados.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.fila}
    >
      <Pressable
        onPress={alLimpiarTodas}
        accessibilityRole="button"
        accessibilityLabel="Ver todas las categorías"
        accessibilityState={{ selected: todasSeleccionadas }}
        style={[estilos.chip, todasSeleccionadas && estilos.chipSeleccionado]}
      >
        <Text
          style={[
            estilos.textoChip,
            todasSeleccionadas && estilos.textoChipSeleccionado,
          ]}
        >
          Todas
        </Text>
      </Pressable>

      {categorias.map((cat) => {
        const estaSeleccionada = idsSeleccionados.includes(cat.id);
        return (
          <Pressable
            key={cat.id}
            onPress={() => alAlternarCategoria(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por categoría ${cat.nombre}`}
            accessibilityState={{ selected: estaSeleccionada }}
            style={[estilos.chip, estaSeleccionada && estilos.chipSeleccionado]}
          >
            <Text
              style={[
                estilos.textoChip,
                estaSeleccionada && estilos.textoChipSeleccionado,
              ]}
            >
              {cat.nombre}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    paddingVertical: espaciado.xs,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
    borderRadius: bordes.completo,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSeleccionado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChip: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.texto,
  },
  textoChipSeleccionado: {
    color: colores.textoPrimario,
  },
});
