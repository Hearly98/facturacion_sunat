import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PurchaseForm } from '../core/purchase.form';
import { PurchaseDetailForm } from 'src/app/purchase-detail/core/types';

/**
 * Valores iniciales que también debe restaurar resetForm(): un reset() sin valores dejaba
 * "Afecta stock" en null y la siguiente compra se registraba sin ingresar mercadería.
 */
export const PURCHASE_FORM_DEFAULTS = {
  // Una compra ingresa mercadería: por defecto afecta stock (el backend asume lo mismo).
  afecta_stock: true,
} as const;

export const buildPurchaseForm = (): {
  [K in keyof PurchaseForm]: K extends 'detalles'
    ? FormArray<FormGroup<{ [P in keyof PurchaseDetailForm]: FormControl<PurchaseDetailForm[P]> }>>
    : FormControl<PurchaseForm[K]>;
} => {
  return {
    mon_id: new FormControl<number | null>(null),
    usu_id: new FormControl<number | null>(null),
    prov_documento: new FormControl<string | null>({ value: null, disabled: true }),
    prod_id: new FormControl<number | null>(null),
    prov_direcc: new FormControl<string | null>(null),
    prov_correo: new FormControl<string | null>(null),
    prov_telf: new FormControl<string | null>(null),
    tip_id: new FormControl<number | null>({ value: null, disabled: true }),
    fechaEmision: new FormControl<Date | null>(null),
    numero: new FormControl<string | null>(null),
    compr_coment: new FormControl<string | null>(null),
    prov_id: new FormControl<number | null>(null),
    mp_cod: new FormControl<string | null>(null),
    suc_id: new FormControl<number | null>(null),
    almacen_id: new FormControl<number | null>(null),
    doc_id: new FormControl<number | null>(null),
    afecta_stock: new FormControl<boolean | null>(PURCHASE_FORM_DEFAULTS.afecta_stock),
    detalles: new FormArray<
      FormGroup<{ [P in keyof PurchaseDetailForm]: FormControl<PurchaseDetailForm[P]> }>
    >([]),
  };
};
