import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function SelectorCantidad({
  valor,
  disponible = 1,
  limiteMaximo = 10,
  alCambiar,
}) {
  const maximoPermitido = Math.max(1, Math.min(disponible, limiteMaximo));
  const puedeDisminuir = valor > 1;
  const puedeAumentar = valor < maximoPermitido;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.columnaTexto}>
        <Text style={estilos.etiqueta}>Cantidad de entradas</Text>
        <Text style={estilos.ayuda}>
          Máximo disponible por compra: {maximoPermitido} (cupo actual:{' '}
          {disponible})
        </Text>
      </View>

      <View style={estilos.controles}>
        <Pressable
          onPress={() => puedeDisminuir && alCambiar(valor - 1)}
          disabled={!puedeDisminuir}
          accessibilityRole="button"
          accessibilityLabel="Disminuir cantidad"
          accessibilityState={{ disabled: !puedeDisminuir }}
          style={[
            estilos.botonPaso,
            !puedeDisminuir && estilos.botonPasoDeshabilitado,
          ]}
        >
          <Ionicons name="remove" size={20} color={colores.texto} />
        </Pressable>

        <Text
          style={estilos.textoValor}
          accessibilityLabel={`Cantidad seleccionada: ${valor}`}
        >
          {valor}
        </Text>

        <Pressable
          onPress={() => puedeAumentar && alCambiar(valor + 1)}
          disabled={!puedeAumentar}
          accessibilityRole="button"
          accessibilityLabel="Aumentar cantidad"
          accessibilityState={{ disabled: !puedeAumentar }}
          style={[
            estilos.botonPaso,
            !puedeAumentar && estilos.botonPasoDeshabilitado,
          ]}
        >
          <Ionicons name="add" size={20} color={colores.texto} />
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.md,
  },
  columnaTexto: {
    flex: 1,
    gap: 2,
  },
  etiqueta: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  botonPaso: {
    width: 44,
    height: 44,
    borderRadius: bordes.md,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPasoDeshabilitado: {
    opacity: 0.4,
  },
  textoValor: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
    minWidth: 28,
    textAlign: 'center',
  },
});
