import { precioConIgv } from './igv';

describe('precioConIgv', () => {
  it('agrega el 18% a un precio gravado (afectación 10 o desconocida)', () => {
    expect(precioConIgv(114, '10')).toBe(134.52);
    expect(precioConIgv(100, null)).toBe(118);
  });

  it('no toca precios exonerados (20) ni inafectos (30)', () => {
    expect(precioConIgv(100, '20')).toBe(100);
    expect(precioConIgv(100, '30')).toBe(100);
  });

  it('redondea a 2 decimales', () => {
    expect(precioConIgv(10.555, '10')).toBe(12.45);
  });
});
