import { FormControl, Validators } from '@angular/forms';
import { KardexFilterForm } from '../core/types/kardex-filter.form';

export const buildKardexFilterForm = (): {
  [K in keyof KardexFilterForm]: FormControl<KardexFilterForm[K]>;
} => ({
  productId: new FormControl<number | null>(null, [Validators.required]),
  warehouseId: new FormControl<number | null>(null, [Validators.required]),
  dateFrom: new FormControl<string | null>(null),
  dateTo: new FormControl<string | null>(null),
});
