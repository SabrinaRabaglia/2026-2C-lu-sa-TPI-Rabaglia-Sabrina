import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatearMoneda } from '@/lib/formato';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function SelectorTipoEntrada({
  tiposEntrada = [],
  idSeleccionado,
  alSeleccionar,
}) {
  return (
    <View style={estilos.lista}>
      {tiposEntrada.map((tipo) => {
        const agotado = tipo.cupo <= 0;
        const seleccionado = idSeleccionado === tipo.id;

        return (
          <Pressable
            key={tipo.id}
            onPress={() => !agotado && alSeleccionar(tipo)}
            disabled={agotado}
            accessibilityRole="radio"
            accessibilityLabel={`${tipo.nombre}, ${formatearMoneda(tipo.precio)}, ${
              agotado ? 'Agotado' : `Quedan ${tipo.cupo}`
            }`}
            accessibilityState={{ selected: seleccionado, disabled: agotado }}
            style={[
              estilos.tarjeta,
              seleccionado && estilos.tarjetaSeleccionada,
              agotado && estilos.tarjetaAgotada,
            ]}
          >
            <View style={estilos.columnaRadio}>
              <Ionicons
                name={seleccionado ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={
                  agotado
                    ? colores.textoSecundario
                    : seleccionado
                      ? colores.primario
                      : colores.textoSecundario
                }
              />
            </View>

            <View style={estilos.columnaInfo}>
              <Text style={[estilos.nombre, agotado && estilos.textoAgotado]}>
                {tipo.nombre}
              </Text>
              {tipo.descripcion ? (
                <Text style={estilos.descripcion}>{tipo.descripcion}</Text>
              ) : null}
              <Text
                style={[
                  estilos.textoCupo,
                  agotado && estilos.etiquetaAgotada,
                ]}
              >
                {agotado ? 'Agotado' : `Quedan ${tipo.cupo} disponibles`}
              </Text>
            </View>

            <Text style={[estilos.precio, agotado && estilos.textoAgotado]}>
              {formatearMoneda(tipo.precio)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: espaciado.md,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    borderWidth: 2,
    borderColor: colores.borde,
    gap: espaciado.md,
  },
  tarjetaSeleccionada: {
    borderColor: colores.primario,
    backgroundColor: colores.primarioClaro,
  },
  tarjetaAgotada: {
    opacity: 0.55,
    backgroundColor: colores.neutroFondo,
  },
  columnaRadio: {
    justifyContent: 'center',
  },
  columnaInfo: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  descripcion: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  textoCupo: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.exito,
    marginTop: 2,
  },
  etiquetaAgotada: {
    color: colores.peligro,
  },
  precio: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.primario,
  },
  textoAgotado: {
    color: colores.textoSecundario,
  },
});
