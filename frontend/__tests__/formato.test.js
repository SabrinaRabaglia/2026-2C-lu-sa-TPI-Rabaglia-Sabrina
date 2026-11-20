import {
  formatearDiasFaltantes,
  formatearFechaCompleta,
  formatearFechaEvento,
  formatearHora,
  formatearMoneda,
  obtenerNombreCompleto,
} from '@/lib/formato';
import { CONFIG_ESTADO_COMPRA } from '@/lib/estadoCompra';

describe('Utilidades de formato y estados de compra', () => {
  describe('formatearMoneda', () => {
    it('formatea montos en pesos argentinos sin decimales', () => {
      const resultado = formatearMoneda(25000);
      expect(resultado).toContain('25.000');
      expect(resultado).toContain('$');
    });

    it('devuelve $ 0 ante valores inválidos o cero', () => {
      expect(formatearMoneda(0)).toContain('0');
      expect(formatearMoneda(null)).toContain('0');
    });
  });

  describe('formateo de fechas', () => {
    it('formatea fechas ISO válidas y maneja fechas inválidas', () => {
      const fechaIso = '2027-06-15T21:00:00.000Z';
      expect(formatearFechaEvento(fechaIso)).toContain('·');
      expect(formatearFechaCompleta(fechaIso)).toContain('2027');
      expect(formatearFechaCompleta(fechaIso)).toContain('hs');
      expect(formatearHora(fechaIso)).toMatch(/^\d{2}:\d{2}$/);

      expect(formatearFechaEvento('fecha-invalida')).toBe('Fecha a confirmar');
      expect(formatearFechaCompleta('fecha-invalida')).toBe('Fecha a confirmar');
      expect(formatearHora('fecha-invalida')).toBe('');
    });
  });

  describe('formatearDiasFaltantes', () => {
    it('muestra "Es hoy", "Mañana", "Faltan N días" y null para eventos pasados', () => {
      const ahora = new Date();
      const unDiaMs = 24 * 60 * 60 * 1000;

      const hoy = new Date(ahora.getTime());
      const maniana = new Date(ahora.getTime() + unDiaMs);
      const enCincoDias = new Date(ahora.getTime() + 5 * unDiaMs);
      const ayer = new Date(ahora.getTime() - unDiaMs);

      expect(formatearDiasFaltantes(hoy.toISOString())).toBe('Es hoy');
      expect(formatearDiasFaltantes(maniana.toISOString())).toBe('Mañana');
      expect(formatearDiasFaltantes(enCincoDias.toISOString())).toBe('Faltan 5 días');
      expect(formatearDiasFaltantes(ayer.toISOString())).toBeNull();
      expect(formatearDiasFaltantes('invalida')).toBeNull();
    });
  });

  describe('obtenerNombreCompleto', () => {
    it('concatena nombre y apellido limpiando espacios', () => {
      expect(obtenerNombreCompleto({ nombre: 'Lucía', apellido: 'Gómez' })).toBe('Lucía Gómez');
      expect(obtenerNombreCompleto(null)).toBe('');
    });
  });

  describe('CONFIG_ESTADO_COMPRA', () => {
    it('define etiqueta, icono y colores para los 5 estados del dominio', () => {
      const estadosEsperados = [
        'PENDIENTE',
        'CONFIRMADA',
        'UTILIZADA',
        'CANCELADA',
        'REEMBOLSADA',
      ];

      for (const estado of estadosEsperados) {
        expect(CONFIG_ESTADO_COMPRA[estado]).toBeDefined();
        expect(CONFIG_ESTADO_COMPRA[estado].etiqueta).toBeTruthy();
        expect(CONFIG_ESTADO_COMPRA[estado].icono).toBeTruthy();
        expect(CONFIG_ESTADO_COMPRA[estado].color).toBeTruthy();
        expect(CONFIG_ESTADO_COMPRA[estado].colorFondo).toBeTruthy();
      }
    });
  });
});
