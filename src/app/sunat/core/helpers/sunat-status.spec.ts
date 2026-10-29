import {
  canIssueCreditNote,
  canSendToSunat,
  isLockedBySunat,
  isValidForSunat,
  SALE_STATE_CANCELLED_BY_CREDIT_NOTE,
  sunatStatusColor,
  sunatStatusLabel,
} from './sunat-status';

describe('sunat-status', () => {
  it('aceptada y observada son válidas ante SUNAT; el resto no', () => {
    expect(isValidForSunat('ACEPTADA')).toBeTrue();
    expect(isValidForSunat('OBSERVADA')).toBeTrue();
    expect(isValidForSunat('PENDIENTE')).toBeFalse();
    expect(isValidForSunat('RECHAZADA')).toBeFalse();
    expect(isValidForSunat('ERROR')).toBeFalse();
    expect(isValidForSunat(undefined)).toBeFalse();
  });

  it('solo se envían boletas que aún no son válidas (incluye reenvío de rechazadas y errores)', () => {
    expect(canSendToSunat('03', 'PENDIENTE')).toBeTrue();
    expect(canSendToSunat('03', 'RECHAZADA')).toBeTrue();
    expect(canSendToSunat('03', 'ERROR')).toBeTrue();
    expect(canSendToSunat('03', 'ACEPTADA')).toBeFalse();
    expect(canSendToSunat('01', 'PENDIENTE')).toBeFalse();
    expect(canSendToSunat('99', 'PENDIENTE')).toBeFalse();
    expect(canSendToSunat(null, 'PENDIENTE')).toBeFalse();
  });

  it('la nota de crédito exige comprobante aceptado y venta no anulada con nota', () => {
    expect(canIssueCreditNote('ACEPTADA', 2)).toBeTrue();
    expect(canIssueCreditNote('OBSERVADA', 1)).toBeTrue();
    expect(canIssueCreditNote('ACEPTADA', SALE_STATE_CANCELLED_BY_CREDIT_NOTE)).toBeFalse();
    expect(canIssueCreditNote('PENDIENTE', 2)).toBeFalse();
  });

  it('un comprobante aceptado queda bloqueado para editar/eliminar', () => {
    expect(isLockedBySunat('ACEPTADA')).toBeTrue();
    expect(isLockedBySunat('RECHAZADA')).toBeFalse();
  });

  it('etiquetas y colores, con pendiente por defecto', () => {
    expect(sunatStatusLabel('OBSERVADA')).toBe('Aceptada con obs.');
    expect(sunatStatusLabel(null)).toBe('Pendiente');
    expect(sunatStatusColor('ACEPTADA')).toBe('success');
    expect(sunatStatusColor('ERROR')).toBe('danger');
    expect(sunatStatusColor(undefined)).toBe('secondary');
  });
});
