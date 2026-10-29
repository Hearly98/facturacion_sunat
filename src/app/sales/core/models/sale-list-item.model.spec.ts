import { SaleListItemModel, toSaleListItem } from './sale-list-item.model';

describe('toSaleListItem', () => {
  it('convierte el total decimal en texto a número', () => {
    const raw = { id: 1, total: '118.50' } as unknown as SaleListItemModel;

    expect(toSaleListItem(raw).total).toBe(118.5);
  });
});
