import { FormControl, Validators } from '@angular/forms';
import { PaymentMethodForm } from '../core/types';

export const buildPaymentMethodForm = (): {
  [K in keyof PaymentMethodForm]: FormControl<PaymentMethodForm[K]>;
} => {
  return {
    id: new FormControl(0),
    name: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    active: new FormControl(true),
  };
};
