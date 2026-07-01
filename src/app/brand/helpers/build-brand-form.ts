import { BrandForm } from '../core/types/brand.form';
import { FormControl, Validators } from '@angular/forms';

export const buildBrandForm = (): {
  [K in keyof BrandForm]: FormControl<BrandForm[K]>;
} => {
  return {
    id: new FormControl<number | null>(null),
    codigo: new FormControl<string | null>(
      null,
      Validators.compose([Validators.required, Validators.minLength(2)]),
    ),
    nombre: new FormControl<string | null>(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
  };
};
