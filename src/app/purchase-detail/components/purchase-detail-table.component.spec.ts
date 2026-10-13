import { TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { PurchaseDetailTableComponent } from './purchase-detail-table.component';
import { buildPurchaseDetailForm } from '../helpers';
import { PurchaseDetailForm } from '../core/types';

// El backend (Compra::calcularTotal) interpreta precioCompra como costo unitario SIN IGV:
//   subtotal = Σ(costo * cantidad - descuento)
//   igv      = subtotal * 0.18
//   total    = subtotal + igv
// La tabla debe mostrar exactamente esos mismos montos.
describe('PurchaseDetailTableComponent', () => {
  function setup(rows: Partial<PurchaseDetailForm>[]) {
    TestBed.configureTestingModule({ imports: [PurchaseDetailTableComponent] });
    const component = TestBed.createComponent(PurchaseDetailTableComponent).componentInstance;
    component.detailsArray = new FormArray(rows.map((r) => buildPurchaseDetailForm(r))) as any;
    component.recalculate(component.detailsArray.getRawValue());
    return component;
  }

  it('costo 100 x 1 sin descuento: base 100, IGV 18, total 118', () => {
    const c = setup([{ prod_id: 1, costo_unitario: 100, cantidad: 1 }]);

    expect(c.totalBase()).toBe(100);
    expect(c.totalIgv()).toBe(18);
    expect(c.totalFinal()).toBe(118);
    const row = c.detailsArray.at(0).getRawValue();
    expect(row.precio_unitario).toBe(118);
    expect(row.precio_compra).toBe(118);
  });

  it('el descuento de línea reduce la base antes del IGV (igual que el backend)', () => {
    const c = setup([{ prod_id: 1, costo_unitario: 20, cantidad: 2, dscto: 5 }]);

    // base = 20*2 - 5 = 35 ; igv = 6.3 ; total = 41.3
    expect(c.totalBase()).toBe(35);
    expect(c.totalIgv()).toBe(6.3);
    expect(c.totalDscto()).toBe(5);
    expect(c.totalFinal()).toBe(41.3);
    expect(c.detailsArray.at(0).getRawValue().precio_compra).toBe(41.3);
  });

  it('suma varias líneas', () => {
    const c = setup([
      { prod_id: 1, costo_unitario: 100, cantidad: 3 },
      { prod_id: 2, costo_unitario: 10, cantidad: 1 },
    ]);

    expect(c.totalBase()).toBe(310);
    expect(c.totalIgv()).toBe(55.8);
    expect(c.totalFinal()).toBe(365.8);
  });

  it('recalcular varias veces no acumula el IGV', () => {
    const c = setup([{ prod_id: 1, costo_unitario: 100, cantidad: 1 }]);
    c.recalculate(c.detailsArray.getRawValue());
    c.recalculate(c.detailsArray.getRawValue());

    expect(c.totalFinal()).toBe(118);
    expect(c.detailsArray.at(0).getRawValue().precio_unitario).toBe(118);
  });
});
