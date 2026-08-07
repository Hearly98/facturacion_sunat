import { FormControl, Validators } from '@angular/forms';
import { CurrencyForm } from '../core/types/currency.form';

export const buildCurrencyForm = (): {
  [K in keyof CurrencyForm]: FormControl<CurrencyForm[K]>;
} => ({
  id: new FormControl(null),
  name: new FormControl(
    null,
    Validators.compose([Validators.required, Validators.minLength(3)]),
  ),
  code: new FormControl(
    null,
    Validators.compose([Validators.required, Validators.minLength(2)]),
  ),
  symbol: new FormControl(
    null,
    Validators.compose([Validators.required]),
  ),
});
