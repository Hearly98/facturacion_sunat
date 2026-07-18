import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandForm } from '../core/types/brand-form';

export function buildBrandForm(fb: FormBuilder, data?: BrandForm): FormGroup {
  return fb.group({
    id: [data?.id ?? null],
    name: [
      data?.name ?? null,
      [Validators.required, Validators.maxLength(100)],
    ],
    code: [
      data?.code ?? null,
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern('^[A-Za-z0-9\-_]+$'),
      ],
    ],
    active: [data?.active ?? true],
  });
}
