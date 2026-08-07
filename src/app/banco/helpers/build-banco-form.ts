import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BancoForm } from '../core/types/banco-form';

export function buildBancoForm(fb: FormBuilder, data?: Partial<BancoForm>): FormGroup {
  return fb.group({
    id: [data?.id ?? null],
    name: [data?.name ?? null, [Validators.required, Validators.maxLength(150)]],
    accountNumber: [data?.accountNumber ?? null, [Validators.required, Validators.maxLength(50)]],
    accountType: [data?.accountType ?? null, [Validators.required]],
    currencyId: [data?.currencyId ?? null, [Validators.required]],
  });
}
