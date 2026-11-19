import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EstadoCarga } from '@/components/EstadoCarga';
import { useSesion } from '@/context/SesionContext';
import { colores } from '@/tema';

export default function LayoutTabsOrganizador() {
  const { usuarioId, modo, hidratado } = useSesion();

  if (!hidratado) {
    return <EstadoCarga />;
  }
  if (!usuarioId) {
    return <Redirect href="/login" />;
  }
  if (modo !== 'ORGANIZADOR') {
    return <Redirect href="/(comprador)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
        },
        headerStyle: {
          backgroundColor: colores.superficie,
        },
        headerTintColor: colores.texto,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis eventos',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={focused ? colores.primario : colores.textoSecundario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="crear"
        options={{
          title: 'Crear',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={size}
              color={focused ? colores.primario : colores.textoSecundario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={focused ? colores.primario : colores.textoSecundario}
            />
          ),
        }}
      />
    </Tabs>
  );
}
