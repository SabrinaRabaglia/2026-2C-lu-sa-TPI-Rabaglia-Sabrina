import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado } from '@/tema';

export function EstrellasPuntaje({
  puntaje = 0,
  tamanio = 18,
  interactivo = false,
  alCambiar,
}) {
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <View
      style={estilos.fila}
      accessibilityRole="adjustable"
      accessibilityLabel={`Puntaje: ${puntaje} de 5`}
    >
      {estrellas.map((estrella) => {
        const llena = puntaje >= estrella;
        const media = !llena && puntaje >= estrella - 0.5;
        const nombreIcono = llena ? 'star' : media ? 'star-half' : 'star-outline';

        if (!interactivo) {
          return (
            <Ionicons
              key={estrella}
              name={nombreIcono}
              size={tamanio}
              color={colores.estrella}
            />
          );
        }

        return (
          <Pressable
            key={estrella}
            onPress={() => alCambiar && alCambiar(estrella)}
            accessibilityRole="button"
            accessibilityLabel={`Calificar con ${estrella} ${
              estrella === 1 ? 'estrella' : 'estrellas'
            }`}
            style={estilos.areaToque}
          >
            <Ionicons
              name={llena ? 'star' : 'star-outline'}
              size={tamanio}
              color={colores.estrella}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  areaToque: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaciado.xs,
  },
});
