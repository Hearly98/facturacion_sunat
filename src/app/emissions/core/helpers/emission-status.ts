import { EmissionStatus } from '../models/emission.models';

const LABELS: Record<EmissionStatus, string> = {
  PROGRAMADA: 'Programada',
  ESPERANDO_DEPENDENCIA: 'Esperando comprobante',
  EN_COLA: 'En cola',
  ENVIANDO: 'Enviando',
  ACEPTADA: 'Aceptada',
  OBSERVADA: 'Aceptada con obs.',
  RECHAZADA: 'Rechazada',
  ERROR: 'Reintentando',
};

const COLORS: Record<EmissionStatus, string> = {
  PROGRAMADA: 'secondary',
  ESPERANDO_DEPENDENCIA: 'light',
  EN_COLA: 'info',
  ENVIANDO: 'info',
  ACEPTADA: 'success',
  OBSERVADA: 'warning',
  RECHAZADA: 'danger',
  ERROR: 'warning',
};

export const emissionStatusLabel = (status: EmissionStatus): string => LABELS[status] ?? status;

export const emissionStatusColor = (status: EmissionStatus): string => COLORS[status] ?? 'secondary';

export const isEmissionValid = (status: EmissionStatus): boolean => status === 'ACEPTADA' || status === 'OBSERVADA';

/** "Enviar ahora": lo pendiente y lo rechazado (tras corregir datos). */
export const canSendNow = (status: EmissionStatus): boolean =>
  status === 'PROGRAMADA' || status === 'ERROR' || status === 'RECHAZADA';

export const canReschedule = (status: EmissionStatus): boolean => status === 'RECHAZADA';

export type DeadlineLevel = 'ok' | 'soon' | 'urgent' | 'expired' | 'done';

/** Semáforo del plazo legal: ya no importa una vez aceptada. */
export const deadlineLevel = (status: EmissionStatus, hoursLeft: number | null): DeadlineLevel => {
  if (isEmissionValid(status)) return 'done';
  if (hoursLeft === null) return 'ok';
  if (hoursLeft < 0) return 'expired';
  if (hoursLeft < 24) return 'urgent';
  if (hoursLeft < 72) return 'soon';
  return 'ok';
};

export const deadlineText = (status: EmissionStatus, hoursLeft: number | null): string => {
  const level = deadlineLevel(status, hoursLeft);
  if (level === 'done' || hoursLeft === null) return '—';
  if (level === 'expired') return 'Vencido';
  if (hoursLeft < 24) return `${hoursLeft} h`;
  return `${Math.floor(hoursLeft / 24)} d ${hoursLeft % 24} h`;
};

export const DEADLINE_COLORS: Record<DeadlineLevel, string> = {
  ok: 'success',
  soon: 'warning',
  urgent: 'danger',
  expired: 'dark',
  done: 'light',
};
