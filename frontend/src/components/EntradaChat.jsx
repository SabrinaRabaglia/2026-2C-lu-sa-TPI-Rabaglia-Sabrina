import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function EntradaChat({ alEnviar, deshabilitado = false }) {
  const [texto, setTexto] = useState('');
  const textoLimpio = texto.trim();
  const puedeEnviar = textoLimpio.length > 0 && !deshabilitado;

  const manejarEnvio = () => {
    if (!puedeEnviar) return;
    alEnviar(textoLimpio);
    setTexto('');
  };

  return (
    <View style={estilos.contenedor}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Escribí un mensaje..."
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel="Escribir mensaje de chat"
        multiline
        maxLength={500}
        onSubmitEditing={(e) => {
          // Ignorar composición IME
          if (e?.nativeEvent?.isComposing) return;
          manejarEnvio();
        }}
        style={estilos.entrada}
      />
      <Pressable
        onPress={manejarEnvio}
        disabled={!puedeEnviar}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensaje"
        accessibilityState={{ disabled: !puedeEnviar }}
        style={[
          estilos.botonEnviar,
          !puedeEnviar && estilos.botonEnviarDeshabilitado,
        ]}
      >
        <Ionicons name="send" size={18} color={colores.textoPrimario} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    gap: espaciado.sm,
  },
  entrada: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    fontSize: tipografia.sm,
    color: colores.texto,
  },
  botonEnviar: {
    width: 44,
    height: 44,
    borderRadius: bordes.completo,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEnviarDeshabilitado: {
    opacity: 0.4,
  },
});
