import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BotonPrimario } from '@/components/BotonPrimario';
import { useSesion } from '@/context/SesionContext';
import { obtenerNombreCompleto } from '@/lib/formato';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

export function VistaPerfil() {
  const enrutador = useRouter();
  const { usuario, modo, cambiarModo, cerrarSesion } = useSesion();
  const [cambiandoModo, setCambiandoModo] = useState(false);

  const manejarCambioModo = async () => {
    setCambiandoModo(true);
    try {
      const nuevoModo = modo === 'COMPRADOR' ? 'ORGANIZADOR' : 'COMPRADOR';
      await cambiarModo(nuevoModo);
      enrutador.replace(
        nuevoModo === 'COMPRADOR' ? '/(comprador)' : '/(organizador)'
      );
    } finally {
      setCambiandoModo(false);
    }
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    enrutador.replace('/login');
  };

  const iniciales = usuario
    ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
    : 'US';

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjetaPerfil}>
        <View style={estilos.avatar}>
          <Text style={estilos.textoAvatar}>{iniciales}</Text>
        </View>
        <Text style={estilos.nombre}>{obtenerNombreCompleto(usuario) || 'Usuario'}</Text>
        {usuario?.email ? (
          <Text style={estilos.email}>{usuario.email}</Text>
        ) : null}
        <View style={estilos.pastillaRol}>
          <Ionicons
            name={modo === 'COMPRADOR' ? 'ticket-outline' : 'megaphone-outline'}
            size={16}
            color={colores.primarioTextoClaro}
          />
          <Text style={estilos.textoPastillaRol}>
            {modo === 'COMPRADOR' ? 'Modo Comprador' : 'Modo Organizador'}
          </Text>
        </View>
      </View>

      <View style={estilos.tarjetaSeccion}>
        <Text style={estilos.tituloSeccion}>Cambiar vista</Text>
        <Text style={estilos.descripcionSeccion}>
          En AI Ticket It cualquier usuario puede comprar entradas o publicar y administrar sus propios eventos.
        </Text>
        <BotonPrimario
          etiqueta={
            modo === 'COMPRADOR'
              ? 'Cambiar a Modo Organizador'
              : 'Cambiar a Modo Comprador'
          }
          alPresionar={manejarCambioModo}
          cargando={cambiandoModo}
          variante="secundario"
        />
      </View>

      <BotonPrimario
        etiqueta="Cerrar sesión"
        alPresionar={manejarCerrarSesion}
        variante="peligro"
        estilo={estilos.botonCerrarSesion}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  tarjetaPerfil: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.sm,
    ...sombras.tarjeta,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.xs,
  },
  textoAvatar: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.primarioTextoClaro,
  },
  nombre: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
  },
  email: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
  pastillaRol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    backgroundColor: colores.primarioClaro,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
    marginTop: espaciado.xs,
  },
  textoPastillaRol: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.primarioTextoClaro,
  },
  tarjetaSeccion: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  descripcionSeccion: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    lineHeight: 20,
  },
  botonCerrarSesion: {
    marginTop: espaciado.xs,
  },
});
