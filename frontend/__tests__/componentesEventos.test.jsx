import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TarjetaEvento } from '@/components/TarjetaEvento';
import { ChipsCategorias } from '@/components/ChipsCategorias';
import { SelectorTipoEntrada } from '@/components/SelectorTipoEntrada';
import { SelectorCantidad } from '@/components/SelectorCantidad';
import { BarraCupo } from '@/components/BarraCupo';

describe('Componentes de Eventos y Compra', () => {
  describe('TarjetaEvento', () => {
    const eventoMock = {
      id: 'ev-1',
      nombre: 'BA Rock Festival 2027',
      fecha: '2027-06-20T21:00:00.000Z',
      categoria: { id: 'cat-1', nombre: 'Recitales' },
      organizador: { id: 'org-1', nombre: 'Martín', apellido: 'Productor' },
      precioMinimo: 25000,
      puntajeOrganizador: 4.5,
      reseniasOrganizador: [{ id: 'r1' }, { id: 'r2' }],
      multimedia: ['https://ejemplo.com/rock.jpg'],
      agotado: false,
    };

    it('muestra datos del evento, reputación del organizador y dispara callbacks al tocar', async () => {
      const alPresionar = jest.fn();
      const alAlternarFavorito = jest.fn();

      await render(
        <TarjetaEvento
          evento={eventoMock}
          esFavorito={false}
          alPresionar={alPresionar}
          alAlternarFavorito={alAlternarFavorito}
        />
      );

      expect(screen.getByText('BA Rock Festival 2027')).toBeTruthy();
      expect(screen.getByText('Recitales')).toBeTruthy();
      expect(screen.getByText('Martín Productor')).toBeTruthy();
      expect(screen.getByText('4.5 (2)')).toBeTruthy();
      expect(screen.queryByText('Agotado')).toBeNull();

      await fireEvent.press(
        screen.getByLabelText('Ver detalle de BA Rock Festival 2027')
      );
      expect(alPresionar).toHaveBeenCalledTimes(1);

      await fireEvent.press(screen.getByLabelText('Agregar a favoritos'));
      expect(alAlternarFavorito).toHaveBeenCalledTimes(1);
    });

    it('muestra insignia "Agotado" y "Sin reseñas" cuando corresponde', async () => {
      const eventoAgotado = {
        ...eventoMock,
        agotado: true,
        puntajeOrganizador: 0,
        reseniasOrganizador: [],
      };

      await render(
        <TarjetaEvento evento={eventoAgotado} esFavorito alPresionar={() => {}} />
      );

      expect(screen.getByText('Agotado')).toBeTruthy();
      expect(screen.getByText('Sin reseñas')).toBeTruthy();
    });
  });

  describe('ChipsCategorias', () => {
    const categorias = [
      { id: 'c1', nombre: 'Recitales' },
      { id: 'c2', nombre: 'Teatro' },
      { id: 'c3', nombre: 'Deportes' },
    ];

    it('permite alternar categorías y limpiar todas con el chip "Todas"', async () => {
      const alAlternar = jest.fn();
      const alLimpiar = jest.fn();

      await render(
        <ChipsCategorias
          categorias={categorias}
          idsSeleccionados={['c1']}
          alAlternarCategoria={alAlternar}
          alLimpiarTodas={alLimpiar}
        />
      );

      await fireEvent.press(screen.getByText('Teatro'));
      expect(alAlternar).toHaveBeenCalledWith('c2');

      await fireEvent.press(screen.getByText('Todas'));
      expect(alLimpiar).toHaveBeenCalledTimes(1);
    });
  });

  describe('SelectorTipoEntrada', () => {
    const tipos = [
      {
        id: 't1',
        nombre: 'Campo General',
        descripcion: 'De pie',
        precio: 25000,
        cupo: 50,
      },
      {
        id: 't2',
        nombre: 'VIP',
        descripcion: 'Acceso preferencial',
        precio: 80000,
        cupo: 0,
      },
    ];

    it('permite elegir un tipo con cupo e impide seleccionar uno agotado', async () => {
      const alSeleccionar = jest.fn();

      await render(
        <SelectorTipoEntrada
          tiposEntrada={tipos}
          idSeleccionado="t1"
          alSeleccionar={alSeleccionar}
        />
      );

      expect(screen.getByText('Quedan 50 disponibles')).toBeTruthy();
      expect(screen.getByText('Agotado')).toBeTruthy();

      await fireEvent.press(screen.getByText('Campo General'));
      expect(alSeleccionar).toHaveBeenCalledWith(tipos[0]);

      alSeleccionar.mockClear();
      await fireEvent.press(screen.getByText('VIP'));
      expect(alSeleccionar).not.toHaveBeenCalled();
    });
  });

  describe('SelectorCantidad', () => {
    it('incrementa y decrementa respetando mínimo 1 y máximo disponible', async () => {
      const alCambiar = jest.fn();

      const { rerender } = await render(
        <SelectorCantidad
          valor={1}
          disponible={3}
          limiteMaximo={10}
          alCambiar={alCambiar}
        />
      );

      // En 1, disminuir no dispara cambio
      await fireEvent.press(screen.getByLabelText('Disminuir cantidad'));
      expect(alCambiar).not.toHaveBeenCalled();

      // Aumentar desde 1 pasa a 2
      await fireEvent.press(screen.getByLabelText('Aumentar cantidad'));
      expect(alCambiar).toHaveBeenCalledWith(2);

      // En el tope (disponible=3), aumentar no dispara cambio
      alCambiar.mockClear();
      await rerender(
        <SelectorCantidad
          valor={3}
          disponible={3}
          limiteMaximo={10}
          alCambiar={alCambiar}
        />
      );
      await fireEvent.press(screen.getByLabelText('Aumentar cantidad'));
      expect(alCambiar).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByLabelText('Disminuir cantidad'));
      expect(alCambiar).toHaveBeenCalledWith(2);
    });
  });

  describe('BarraCupo', () => {
    it('muestra correctamente entradas restantes y estado agotado', async () => {
      const { rerender } = await render(
        <BarraCupo nombre="Platea" precio={45000} disponible={15} vendidas={5} />
      );

      expect(screen.getByText('Quedan 15 de 20')).toBeTruthy();

      await rerender(
        <BarraCupo nombre="Platea" precio={45000} disponible={0} vendidas={20} />
      );
      expect(screen.getByText('Agotado (20/20)')).toBeTruthy();
    });
  });
});
