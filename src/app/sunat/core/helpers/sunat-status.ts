import { SunatStatus } from '../models/sunat.models';

/** Códigos de documento (catálogo 01) que el sistema envía a SUNAT por ahora. */
export const SUNAT_EMITTABLE_DOCUMENTS = ['03'];

/** Estado de venta "Anulado con Nota de Crédito" (estado_ventas.id). */
export const SALE_STATE_CANCELLED_BY_CREDIT_NOTE = 4;

const LABELS: Record<SunatStatus, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  OBSERVADA: 'Aceptada con obs.',
  RECHAZADA: 'Rechazada',
  ERROR: 'Error de envío',
};

const COLORS: Record<SunatStatus, string> = {
  PENDIENTE: 'secondary',
  ACEPTADA: 'success',
  OBSERVADA: 'warning',
  RECHAZADA: 'danger',
  ERROR: 'danger',
};

export const sunatStatusLabel = (status: SunatStatus | null | undefined): string => LABELS[status ?? 'PENDIENTE'];

export const sunatStatusColor = (status: SunatStatus | null | undefined): string => COLORS[status ?? 'PENDIENTE'];

/** Aceptada u observada: el comprobante existe para SUNAT y es válido. */
export const isValidForSunat = (status: SunatStatus | null | undefined): boolean =>
  status === 'ACEPTADA' || status === 'OBSERVADA';

/** Se puede enviar (o reenviar) si es un documento electrónico y aún no es válido ante SUNAT. */
export const canSendToSunat = (documentCode: string | null | undefined, status: SunatStatus | null | undefined): boolean =>
  SUNAT_EMITTABLE_DOCUMENTS.includes(documentCode ?? '') && !isValidForSunat(status);

/** Solo sobre comprobantes aceptados y que no hayan sido anulados ya con nota de crédito. */
export const canIssueCreditNote = (status: SunatStatus | null | undefined, saleStateId: number | null | undefined): boolean =>
  isValidForSunat(status) && saleStateId !== SALE_STATE_CANCELLED_BY_CREDIT_NOTE;

/** Un comprobante aceptado no se edita ni se elimina: se revierte con nota de crédito. */
export const isLockedBySunat = (status: SunatStatus | null | undefined): boolean => isValidForSunat(status);
