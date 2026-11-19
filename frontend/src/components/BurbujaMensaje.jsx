import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatearHora, obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function BurbujaMensaje({ mensaje, esPropio, organizadorId }) {
  const emisorId = mensaje?.usuario?.id;
  const rolEmisor =
    emisorId && emisorId === organizadorId ? 'Organizador' : 'Comprador';
  const nombreEmisor = obtenerNombreCompleto(mensaje?.usuario) || rolEmisor;

  return (
    <View
      style={[
        estilos.fila,
        esPropio ? estilos.filaPropia : estilos.filaAjena,
      ]}
    >
      <View
        style={[
          estilos.burbuja,
          esPropio ? estilos.burbujaPropia : estilos.burbujaAjena,
        ]}
      >
        {!esPropio ? (
          <Text style={estilos.etiquetaEmisor}>
            {nombreEmisor} · {rolEmisor}
          </Text>
        ) : null}
        <Text
          style={[
            estilos.textoMensaje,
            esPropio ? estilos.textoPropio : estilos.textoAjeno,
          ]}
        >
          {mensaje?.mensaje}
        </Text>
        <Text
          style={[
            estilos.textoHora,
            esPropio ? estilos.horaPropia : estilos.horaAjena,
          ]}
        >
          {formatearHora(mensaje?.enviado)}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    marginVertical: espaciado.xs,
    paddingHorizontal: espaciado.md,
  },
  filaPropia: {
    justifyContent: 'flex-end',
  },
  filaAjena: {
    justifyContent: 'flex-start',
  },
  burbuja: {
    maxWidth: '80%',
    borderRadius: bordes.lg,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm + 2,
    gap: 2,
  },
  burbujaPropia: {
    backgroundColor: colores.primario,
    borderBottomRightRadius: 4,
  },
  burbujaAjena: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderBottomLeftRadius: 4,
  },
  etiquetaEmisor: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
    marginBottom: 2,
  },
  textoMensaje: {
    fontSize: tipografia.sm,
    lineHeight: 20,
  },
  textoPropio: {
    color: colores.textoPrimario,
  },
  textoAjeno: {
    color: colores.texto,
  },
  textoHora: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  horaPropia: {
    color: 'rgba(255, 255, 255, 0.78)',
  },
  horaAjena: {
    color: colores.textoSecundario,
  },
});
