import { differenceInCalendarDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

const formateadorArs = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function formatearMoneda(monto) {
  return formateadorArs.format(Number(monto) || 0);
}

/**
 * Ejemplo: "sáb 12 dic · 21:00"
 */
export function formatearFechaEvento(fechaIso) {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha a confirmar';
  }
  return format(fecha, "eee d MMM '·' HH:mm", { locale: es });
}

/**
 * Ejemplo: "12 de diciembre de 2026, 21:00 hs"
 */
export function formatearFechaCompleta(fechaIso) {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha a confirmar';
  }
  return `${format(fecha, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })} hs`;
}

/**
 * Ejemplo: "14:35"
 */
export function formatearHora(fechaIso) {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return '';
  }
  return format(fecha, 'HH:mm', { locale: es });
}

/**
 * Regla UC-1: mostrar "Es hoy" (0), "Mañana" (1) o "Faltan N días" para compras CONFIRMADAS.
 */
export function formatearDiasFaltantes(fechaEventoIso) {
  const fechaEvento = new Date(fechaEventoIso);
  if (Number.isNaN(fechaEvento.getTime())) {
    return null;
  }
  const diferencia = differenceInCalendarDays(fechaEvento, new Date());
  if (diferencia < 0) {
    return null;
  }
  if (diferencia === 0) {
    return 'Es hoy';
  }
  if (diferencia === 1) {
    return 'Mañana';
  }
  return `Faltan ${diferencia} días`;
}

export function obtenerNombreCompleto(usuario) {
  if (!usuario) return '';
  return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
}
