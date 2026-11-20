import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SesionProvider } from '@/context/SesionContext';
import { colores } from '@/tema';

export default function LayoutRaiz() {
  const [clienteQuery] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 15_000,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={clienteQuery}>
        <SesionProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colores.superficie },
              headerTintColor: colores.texto,
              headerTitleStyle: { fontWeight: '700' },
              headerBackTitle: 'Atrás',
              contentStyle: { backgroundColor: colores.fondo },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen
              name="registro"
              options={{ title: 'Crear cuenta' }}
            />
            <Stack.Screen name="(comprador)" options={{ headerShown: false }} />
            <Stack.Screen name="(organizador)" options={{ headerShown: false }} />
            <Stack.Screen
              name="evento/[id]"
              options={{ title: 'Detalle del evento' }}
            />
            <Stack.Screen
              name="evento/[id]/comprar"
              options={{ title: 'Comprar entradas' }}
            />
            <Stack.Screen
              name="evento/[id]/ventas"
              options={{ title: 'Ventas y cupos' }}
            />
            <Stack.Screen
              name="compra/[id]"
              options={{ title: 'Detalle de compra' }}
            />
            <Stack.Screen
              name="compra/[id]/chat"
              options={{ title: 'Chat de la compra' }}
            />
            <Stack.Screen
              name="compra/[id]/resenia"
              options={{ title: 'Calificar evento' }}
            />
          </Stack>
        </SesionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
