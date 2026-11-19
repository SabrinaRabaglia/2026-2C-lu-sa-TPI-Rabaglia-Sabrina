import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export const OPCIONES_ORDEN = [
  {
    id: 'fecha_asc',
    etiqueta: 'Fecha: más próximos primero',
    ordenarPor: 'fecha',
    direccion: 'asc',
    icono: 'calendar-outline',
  },
  {
    id: 'fecha_desc',
    etiqueta: 'Fecha: más lejanos primero',
    ordenarPor: 'fecha',
    direccion: 'desc',
    icono: 'calendar-outline',
  },
  {
    id: 'precio_asc',
    etiqueta: 'Precio: menor a mayor',
    ordenarPor: 'precio',
    direccion: 'asc',
    icono: 'pricetag-outline',
  },
  {
    id: 'precio_desc',
    etiqueta: 'Precio: mayor a menor',
    ordenarPor: 'precio',
    direccion: 'desc',
    icono: 'pricetag-outline',
  },
  {
    id: 'puntaje_desc',
    etiqueta: 'Puntaje del organizador: mejor primero',
    ordenarPor: 'puntaje',
    direccion: 'desc',
    icono: 'star-outline',
  },
];

export function ModalOrdenamiento({
  visible,
  idOpcionSeleccionada,
  alSeleccionar,
  alCerrar,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={alCerrar}
    >
      <Pressable style={estilos.fondoOscuro} onPress={alCerrar}>
        <Pressable
          style={estilos.panel}
          onPress={(e) => e.stopPropagation?.()}
        >
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Ordenar eventos por</Text>
            <Pressable
              onPress={alCerrar}
              accessibilityRole="button"
              accessibilityLabel="Cerrar opciones de ordenamiento"
              style={estilos.botonCerrar}
            >
              <Ionicons name="close" size={22} color={colores.texto} />
            </Pressable>
          </View>

          {OPCIONES_ORDEN.map((opcion) => {
            const seleccionada = opcion.id === idOpcionSeleccionada;
            return (
              <Pressable
                key={opcion.id}
                onPress={() => {
                  alSeleccionar(opcion);
                  alCerrar();
                }}
                accessibilityRole="button"
                accessibilityLabel={opcion.etiqueta}
                accessibilityState={{ selected: seleccionada }}
                style={[
                  estilos.filaOpcion,
                  seleccionada && estilos.filaOpcionSeleccionada,
                ]}
              >
                <View style={estilos.izquierdaOpcion}>
                  <Ionicons
                    name={opcion.icono}
                    size={20}
                    color={
                      seleccionada ? colores.primario : colores.textoSecundario
                    }
                  />
                  <Text
                    style={[
                      estilos.etiquetaOpcion,
                      seleccionada && estilos.etiquetaOpcionSeleccionada,
                    ]}
                  >
                    {opcion.etiqueta}
                  </Text>
                </View>
                {seleccionada ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colores.primario}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondoOscuro: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 31, 0.45)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: bordes.lg,
    borderTopRightRadius: bordes.lg,
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.xs,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  titulo: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
  },
  botonCerrar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaOpcion: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: bordes.md,
  },
  filaOpcionSeleccionada: {
    backgroundColor: colores.primarioClaro,
  },
  izquierdaOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    flex: 1,
  },
  etiquetaOpcion: {
    fontSize: tipografia.sm,
    color: colores.texto,
    fontWeight: '500',
  },
  etiquetaOpcionSeleccionada: {
    color: colores.primario,
    fontWeight: '700',
  },
});
