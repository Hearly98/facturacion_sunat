import { FormBuilder } from '@angular/forms';
import { buildPurchaseForm, PURCHASE_FORM_DEFAULTS } from './build-purchase-form';

describe('buildPurchaseForm', () => {
  it('una compra afecta stock por defecto (igual que el backend y que ventas)', () => {
    // Antes venía desmarcado: si el usuario no lo notaba, la compra se registraba sin
    // ingresar la mercadería al almacén y sin ningún aviso.
    const form = new FormBuilder().group(buildPurchaseForm());

    expect(form.get('afecta_stock')!.value).toBeTrue();
  });

  it('al limpiar el formulario tras guardar vuelve a afectar stock', () => {
    const form = new FormBuilder().group(buildPurchaseForm());
    form.patchValue({ afecta_stock: false });

    form.reset(PURCHASE_FORM_DEFAULTS);

    expect(form.get('afecta_stock')!.value).toBeTrue();
  });
});
