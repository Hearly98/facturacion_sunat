import { FormControl, FormGroup } from '@angular/forms';
import { PurchaseDetailForm } from '../core/types';

export const buildPurchaseDetailForm = (
  productData?: Partial<PurchaseDetailForm>
): FormGroup<{ [P in keyof PurchaseDetailForm]: FormControl<PurchaseDetailForm[P]> }> => {
  return new FormGroup({
    prod_id: new FormControl<number | null>(productData?.prod_id || null),
    prod_nom: new FormControl<string | null>(productData?.prod_nom || null),
    prod_cod_interno: new FormControl<string | null>(productData?.prod_cod_interno || null),
    cantidad: new FormControl<number | null>(productData?.cantidad || null),
    unidad: new FormControl<string | null>(productData?.unidad || null),
    costo_unitario: new FormControl<number | null>(productData?.costo_unitario || null),
    precio_unitario: new FormControl<number | null>({
      value: productData?.precio_unitario || 0,
      disabled: true,
    }),
    precio_compra: new FormControl<number | null>({
      value: productData?.precio_compra || 0,
      disabled: true,
    }),
    dscto: new FormControl<number | null>(productData?.dscto || null),
  });
};
