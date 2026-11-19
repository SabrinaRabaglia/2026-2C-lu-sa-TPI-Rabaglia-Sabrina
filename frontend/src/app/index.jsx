import React from 'react';
import { Redirect } from 'expo-router';
import { EstadoCarga } from '@/components/EstadoCarga';
import { useSesion } from '@/context/SesionContext';

export default function PantallaIndice() {
  const { usuarioId, modo, hidratado, cargandoUsuario } = useSesion();

  if (!hidratado || cargandoUsuario) {
    return <EstadoCarga mensaje="Iniciando AI Ticket It..." />;
  }

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  return (
    <Redirect href={modo === 'COMPRADOR' ? '/(comprador)' : '/(organizador)'} />
  );
}
