import { toPurchaseDetailPayload } from './to-purchase-detail-payload';

describe('toPurchaseDetailPayload', () => {
  it('envía el costo unitario SIN IGV como precioCompra, no el total de línea', () => {
    const payload = toPurchaseDetailPayload([
      {
        prod_id: 7,
        prod_nom: 'Tornillo',
        prod_cod_interno: 'T-1',
        cantidad: 3,
        unidad: 'NIU',
        costo_unitario: 100,
        precio_unitario: 118,
        precio_compra: 354,
        dscto: 5,
      },
    ]);

    expect(payload).toEqual([{ idProducto: 7, cantidad: 3, precioCompra: 100, descuento: 5 }]);
  });

  it('normaliza descuento nulo a 0', () => {
    const [detalle] = toPurchaseDetailPayload([
      {
        prod_id: 1,
        prod_nom: null,
        prod_cod_interno: null,
        cantidad: 1,
        unidad: null,
        costo_unitario: 10,
        precio_unitario: null,
        precio_compra: null,
        dscto: null,
      },
    ]);

    expect(detalle.descuento).toBe(0);
  });
});
