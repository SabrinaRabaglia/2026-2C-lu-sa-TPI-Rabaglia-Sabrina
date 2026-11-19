import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function BarraBusqueda({
  valor,
  alCambiarTexto,
  marcador = 'Buscar eventos o artistas...',
}) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="search-outline" size={20} color={colores.textoSecundario} />
      <TextInput
        value={valor}
        onChangeText={alCambiarTexto}
        placeholder={marcador}
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel="Buscar eventos"
        returnKeyType="search"
        style={estilos.entrada}
      />
      {valor ? (
        <Pressable
          onPress={() => alCambiarTexto('')}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          style={estilos.botonLimpiar}
        >
          <Ionicons name="close-circle" size={20} color={colores.textoSecundario} />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: espaciado.md,
    minHeight: 46,
    gap: espaciado.sm,
  },
  entrada: {
    flex: 1,
    fontSize: tipografia.sm,
    color: colores.texto,
    paddingVertical: espaciado.sm,
  },
  botonLimpiar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
