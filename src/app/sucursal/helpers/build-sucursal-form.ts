import { FormControl, Validators } from '@angular/forms';
import { SucursalForm } from '../core/types';

export const buildSucursalForm = (): {
  [K in keyof SucursalForm]: FormControl<SucursalForm[K]>;
} => {
  return {
    id: new FormControl(null),
    companyId: new FormControl(null),
    code: new FormControl(null),
    name: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    zip: new FormControl(null),
    address: new FormControl(null),
    department: new FormControl(null),
    province: new FormControl(null),
    district: new FormControl(null),
  };
};
