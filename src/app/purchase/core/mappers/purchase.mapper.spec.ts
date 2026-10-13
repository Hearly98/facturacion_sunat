import { PurchaseDto } from '../dto/purchase.dto';
import { PurchaseMapper } from './purchase.mapper';

describe('PurchaseMapper', () => {
  const purchaseWith = (detalle: Record<string, unknown>): PurchaseDto =>
    ({
      id: 1,
      detalles: [
        { id: 10, compra_id: 1, producto_id: 5, precio_compra: '100.00', cantidad: 3, total: '280.00', ...detalle },
      ],
    }) as unknown as PurchaseDto;

  // REGRESSION: the line discount was lost when reopening a purchase for editing.
  it('maps the line discount from the API', () => {
    const [detail] = PurchaseMapper.fromApi(purchaseWith({ descuento: '20.00' })).details;

    expect(detail.discount).toBe(20);
    expect(detail.unitCost).toBe(100);
    expect(detail.total).toBe(280);
  });

  it('defaults the discount to 0 when the API does not send it', () => {
    const [detail] = PurchaseMapper.fromApi(purchaseWith({})).details;

    expect(detail.discount).toBe(0);
  });
});
