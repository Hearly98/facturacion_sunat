import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandFilterForm } from '../core/types/brand-form';

export function buildBrandFilterForm(fb: FormBuilder, data?: Partial<BrandFilterForm>): FormGroup {
  return fb.group({
    name: [data?.name ?? null],
    code: [data?.code ?? null],
  });
}
