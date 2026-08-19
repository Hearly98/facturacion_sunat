import { FormControl, Validators } from '@angular/forms';
import { SupplierForm } from '../core/types/supplier-form';

export const buildSupplierForm = (): {
  [K in keyof SupplierForm]: FormControl<SupplierForm[K]>;
} => {
  return {
    id: new FormControl(null),
    companyId: new FormControl(1),
    active: new FormControl(true),
    name: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    email: new FormControl(null, Validators.email),
    address: new FormControl(null, Validators.minLength(3)),
    documentTypeId: new FormControl(null, Validators.required),
    document: new FormControl(null, Validators.required),
    phone: new FormControl(null),
    bank: new FormControl(null),
    account: new FormControl(null),
  };
};
