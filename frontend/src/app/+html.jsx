import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function RootHtml({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>AI Ticket It - Entradas para Eventos</title>
        <meta
          name="description"
          content="AI Ticket It: plataforma para descubrir recitales, obras de teatro, conferencias, festivales y eventos deportivos, y comprar tus entradas de forma rápida y segura."
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
