import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatearMoneda } from '@/lib/formato';
import { bordes, colores, espaciado, tipografia } from '@/tema';

export function BarraCupo({ nombre, precio, disponible, vendidas = 0 }) {
  const capacidadTotal = Math.max(1, disponible + vendidas);
  const proporcionVendida = Math.min(1, Math.max(0, vendidas / capacidadTotal));
  const agotado = disponible <= 0;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.filaEncabezado}>
        <Text style={estilos.nombre}>
          {nombre} · {formatearMoneda(precio)}
        </Text>
        <Text style={[estilos.textoConteo, agotado && estilos.textoAgotado]}>
          {agotado
            ? `Agotado (${vendidas}/${capacidadTotal})`
            : `Quedan ${disponible} de ${capacidadTotal}`}
        </Text>
      </View>

      <View style={estilos.pista}>
        <View
          style={[
            estilos.relleno,
            {
              width: `${Math.round(proporcionVendida * 100)}%`,
              backgroundColor: agotado ? colores.peligro : colores.primario,
            },
          ]}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
    paddingVertical: espaciado.xs,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  nombre: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
    flex: 1,
  },
  textoConteo: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoAgotado: {
    color: colores.peligro,
  },
  pista: {
    height: 8,
    borderRadius: bordes.completo,
    backgroundColor: colores.borde,
    overflow: 'hidden',
  },
  relleno: {
    height: '100%',
    borderRadius: bordes.completo,
  },
});
