import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InsigniaEstado } from '@/components/InsigniaEstado';
import { PastillaDiasFaltantes } from '@/components/PastillaDiasFaltantes';
import { EstrellasPuntaje } from '@/components/EstrellasPuntaje';
import { BurbujaMensaje } from '@/components/BurbujaMensaje';
import { EntradaChat } from '@/components/EntradaChat';

describe('Componentes de Compras, Chat y Reseñas', () => {
  describe('InsigniaEstado', () => {
    it('renderiza la etiqueta correcta para cada estado de compra', async () => {
      const casos = [
        ['PENDIENTE', 'Pendiente de pago'],
        ['CONFIRMADA', 'Confirmada'],
        ['UTILIZADA', 'Utilizada'],
        ['CANCELADA', 'Cancelada'],
        ['REEMBOLSADA', 'Reembolsada'],
      ];

      for (const [estado, etiquetaEsperada] of casos) {
        const { unmount } = await render(<InsigniaEstado estado={estado} />);
        expect(screen.getByText(etiquetaEsperada)).toBeTruthy();
        await unmount();
      }
    });
  });

  describe('PastillaDiasFaltantes', () => {
    it('muestra "Es hoy", "Mañana", "Faltan N días" y se oculta si es null', async () => {
      const { rerender } = await render(
        <PastillaDiasFaltantes diasDesdeBackend={0} />
      );
      expect(screen.getByText('Es hoy')).toBeTruthy();

      await rerender(<PastillaDiasFaltantes diasDesdeBackend={1} />);
      expect(screen.getByText('Mañana')).toBeTruthy();

      await rerender(<PastillaDiasFaltantes diasDesdeBackend={15} />);
      expect(screen.getByText('Faltan 15 días')).toBeTruthy();

      await rerender(<PastillaDiasFaltantes diasDesdeBackend={null} />);
      expect(screen.queryByText(/Faltan|Mañana|Es hoy/)).toBeNull();
    });
  });

  describe('EstrellasPuntaje', () => {
    it('permite seleccionar una puntuación de 1 a 5 en modo interactivo', async () => {
      const alCambiar = jest.fn();
      await render(
        <EstrellasPuntaje puntaje={3} interactivo alCambiar={alCambiar} />
      );

      await fireEvent.press(screen.getByLabelText('Calificar con 5 estrellas'));
      expect(alCambiar).toHaveBeenCalledWith(5);

      await fireEvent.press(screen.getByLabelText('Calificar con 1 estrella'));
      expect(alCambiar).toHaveBeenCalledWith(1);
    });
  });

  describe('BurbujaMensaje', () => {
    const mensajeOrganizador = {
      id: 'm1',
      usuario: { id: 'org-1', nombre: 'Martín', apellido: 'Productor' },
      mensaje: 'Las puertas abren a las 18 hs.',
      enviado: '2026-11-19T18:30:00.000Z',
    };

    it('identifica al emisor como Organizador en mensajes recibidos y oculta el encabezado en mensajes propios', async () => {
      const { rerender } = await render(
        <BurbujaMensaje
          mensaje={mensajeOrganizador}
          esPropio={false}
          organizadorId="org-1"
        />
      );

      expect(screen.getByText('Martín Productor · Organizador')).toBeTruthy();
      expect(screen.getByText('Las puertas abren a las 18 hs.')).toBeTruthy();

      await rerender(
        <BurbujaMensaje
          mensaje={mensajeOrganizador}
          esPropio
          organizadorId="org-1"
        />
      );
      expect(screen.queryByText('Martín Productor · Organizador')).toBeNull();
      expect(screen.getByText('Las puertas abren a las 18 hs.')).toBeTruthy();
    });
  });

  describe('EntradaChat', () => {
    it('no envía mensajes vacíos y limpia el input tras enviar un mensaje válido', async () => {
      const alEnviar = jest.fn();
      await render(<EntradaChat alEnviar={alEnviar} />);

      const campo = screen.getByLabelText('Escribir mensaje de chat');
      const botonEnviar = screen.getByLabelText('Enviar mensaje');

      await fireEvent.press(botonEnviar);
      expect(alEnviar).not.toHaveBeenCalled();

      await fireEvent.changeText(campo, '   Hola, ¿hay guardarropas?   ');
      await fireEvent.press(botonEnviar);

      expect(alEnviar).toHaveBeenCalledWith('Hola, ¿hay guardarropas?');
      expect(campo.props.value).toBe('');
    });
  });
});
