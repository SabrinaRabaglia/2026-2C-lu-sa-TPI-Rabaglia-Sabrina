import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EstadoCarga } from '@/components/EstadoCarga';
import { useSesion } from '@/context/SesionContext';
import { colores } from '@/tema';

export default function LayoutTabsComprador() {
  const { usuarioId, modo, hidratado } = useSesion();

  if (!hidratado) {
    return <EstadoCarga />;
  }
  if (!usuarioId) {
    return <Redirect href="/login" />;
  }
  if (modo !== 'COMPRADOR') {
    return <Redirect href="/(organizador)" />;
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
          title: 'Explorar',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={focused ? colores.primario : colores.textoSecundario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={focused ? colores.primario : colores.textoSecundario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="compras"
        options={{
          title: 'Mis compras',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'ticket' : 'ticket-outline'}
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
