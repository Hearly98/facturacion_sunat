import { canReschedule, canSendNow, deadlineLevel, deadlineText, emissionStatusLabel, isEmissionValid } from './emission-status';

describe('emission-status', () => {
  it('etiquetas legibles para el usuario', () => {
    expect(emissionStatusLabel('ESPERANDO_DEPENDENCIA')).toBe('Esperando comprobante');
    expect(emissionStatusLabel('ERROR')).toBe('Reintentando');
  });

  it('solo se envía ahora lo pendiente, lo fallido y lo rechazado', () => {
    expect(canSendNow('PROGRAMADA')).toBeTrue();
    expect(canSendNow('ERROR')).toBeTrue();
    expect(canSendNow('RECHAZADA')).toBeTrue();
    expect(canSendNow('ESPERANDO_DEPENDENCIA')).toBeFalse();
    expect(canSendNow('EN_COLA')).toBeFalse();
    expect(canSendNow('ACEPTADA')).toBeFalse();
  });

  it('solo se reprograma lo rechazado', () => {
    expect(canReschedule('RECHAZADA')).toBeTrue();
    expect(canReschedule('ERROR')).toBeFalse();
  });

  it('semáforo del plazo legal', () => {
    expect(deadlineLevel('ACEPTADA', -5)).toBe('done');
    expect(deadlineLevel('PROGRAMADA', -1)).toBe('expired');
    expect(deadlineLevel('PROGRAMADA', 10)).toBe('urgent');
    expect(deadlineLevel('PROGRAMADA', 48)).toBe('soon');
    expect(deadlineLevel('PROGRAMADA', 176)).toBe('ok');
    expect(isEmissionValid('OBSERVADA')).toBeTrue();
  });

  it('texto del plazo restante', () => {
    expect(deadlineText('PROGRAMADA', 176)).toBe('7 d 8 h');
    expect(deadlineText('PROGRAMADA', 10)).toBe('10 h');
    expect(deadlineText('PROGRAMADA', -3)).toBe('Vencido');
    expect(deadlineText('ACEPTADA', 100)).toBe('—');
  });
});
