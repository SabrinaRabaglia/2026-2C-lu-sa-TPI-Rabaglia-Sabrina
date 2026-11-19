import { colores } from '@/tema';

/**
 * Única fuente de verdad para íconos, etiquetas y colores de los 5 estados de compra.
 * Siempre se muestran combinando ícono + texto.
 */
export const CONFIG_ESTADO_COMPRA = {
  PENDIENTE: {
    etiqueta: 'Pendiente de pago',
    color: colores.advertencia,
    colorFondo: colores.advertenciaFondo,
    icono: 'time-outline',
  },
  CONFIRMADA: {
    etiqueta: 'Confirmada',
    color: colores.exito,
    colorFondo: colores.exitoFondo,
    icono: 'checkmark-circle-outline',
  },
  UTILIZADA: {
    etiqueta: 'Utilizada',
    color: colores.info,
    colorFondo: colores.infoFondo,
    icono: 'ticket-outline',
  },
  CANCELADA: {
    etiqueta: 'Cancelada',
    color: colores.neutro,
    colorFondo: colores.neutroFondo,
    icono: 'close-circle-outline',
  },
  REEMBOLSADA: {
    etiqueta: 'Reembolsada',
    color: colores.violeta,
    colorFondo: colores.violetaFondo,
    icono: 'return-down-back-outline',
  },
};
